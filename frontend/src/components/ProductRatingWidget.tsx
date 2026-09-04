'use client';

import React, { useState, useEffect } from 'react';
import { getBackendUrl } from '@/utils/api';

interface Props {
  productId: string;
  productSlug?: string;
  categorySlug?: string;
  brandName?: string;
  catalogId?: string;
}

export default function ProductRatingWidget({
  productId,
  productSlug,
  categorySlug,
  brandName,
  catalogId,
}: Props) {
  // Generate deterministic catalog number and brand name fallback if not explicitly passed
  const hash = productId ? productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 1000;
  const catalogNo = catalogId || String(1020100 + (hash % 9000));

  const displayBrand = brandName || (
    categorySlug === 'anatomy-models' ? '3B Scientific - Germany' :
    categorySlug === 'medical-simulators' ? 'Simulaids - USA' :
    'Gaumard Scientific - USA'
  );

  const [avgRating, setAvgRating] = useState<number>(0);
  const [reviewsCount, setReviewsCount] = useState<number>(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [rated, setRated] = useState<boolean>(false);
  const [visitorId, setVisitorId] = useState<string>('');

  // 1. Initialize visitorId from localStorage or generate one
  useEffect(() => {
    let vid = localStorage.getItem('visitor_id');
    if (!vid) {
      vid = 'v_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('visitor_id', vid);
    }
    setVisitorId(vid);
  }, []);

  // 2. Fetch live rating info and check if this visitor has already rated
  useEffect(() => {
    if (!visitorId || !productId) return;

    const fetchRatingInfo = async () => {
      try {
        const res = await fetch(getBackendUrl(`http://127.0.0.1:5001/api/public/products/${productId}/rating-info?visitorId=${visitorId}`));
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setAvgRating(typeof data.ratingAverage === 'number' ? data.ratingAverage : 0);
            setReviewsCount(typeof data.ratingCount === 'number' ? data.ratingCount : 0);
            if (data.userRating) {
              setUserRating(data.userRating);
              setRated(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching rating info:', error);
      }
    };

    fetchRatingInfo();
  }, [productId, visitorId]);

  // 3. Handle rating submission and update
  const handleRate = async (rating: number) => {
    if (!visitorId || !productId) return;

    const previousUserRating = userRating;
    const previousRated = rated;

    setUserRating(rating);
    setRated(true);

    try {
      const res = await fetch(getBackendUrl(`http://127.0.0.1:5001/api/public/products/${productId}/rate`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, rating }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAvgRating(data.ratingAverage);
          setReviewsCount(data.ratingCount);
          setUserRating(data.userRating);
        } else {
          setUserRating(previousUserRating);
          setRated(previousRated);
        }
      } else {
        setUserRating(previousUserRating);
        setRated(previousRated);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      setUserRating(previousUserRating);
      setRated(previousRated);
    }
  };

  // Render static 5-star display matching the screenshot
  const renderDisplayStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, idx) => {
      const fillAmount = Math.max(0, Math.min(1, rating - idx));
      return (
        <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', marginRight: '3px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <defs>
              <linearGradient id={`star-grad-${productId}-${idx}`}>
                <stop offset={`${fillAmount * 100}%`} stopColor="#f59e0b" />
                <stop offset={`${fillAmount * 100}%`} stopColor="#e2e8f0" />
              </linearGradient>
            </defs>
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              fill={`url(#star-grad-${productId}-${idx})`}
            />
          </svg>
        </span>
      );
    });
  };

  // Render interactive 5-star rating picker matching the screenshot
  const renderInteractiveStars = () => {
    return Array.from({ length: 5 }).map((_, idx) => {
      const starValue = idx + 1;
      const isFilled = starValue <= (hoverRating ?? userRating ?? 0);

      return (
        <span
          key={idx}
          onClick={() => handleRate(starValue)}
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(null)}
          style={{
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            marginRight: '4px',
            transition: 'transform 0.15s ease',
            transform: hoverRating === starValue ? 'scale(1.2)' : 'none',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={isFilled ? '#f59e0b' : '#e2e8f0'}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </span>
      );
    });
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productSlug ? productSlug.replace(/-/g, ' ') : 'Medical Product',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avgRating.toFixed(1),
      reviewCount: Math.max(1, reviewsCount),
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '10px 0' }}>
      {/* Google Rich Snippet SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Row 1: Rating Stars + Average Score + Count Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {renderDisplayStars(avgRating)}
        </div>
        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
          {avgRating.toFixed(1)}
        </span>
        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
          ({reviewsCount})
        </span>
      </div>

      {/* Row 2: "Rate it!" Label + Interactive Stars */}
      <div style={{ marginTop: '10px' }}>
        <div style={{ fontSize: '0.92rem', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>
          {rated ? 'Change rating' : 'Rate it!'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {renderInteractiveStars()}
        </div>
        {rated && (
          <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 650, marginTop: '4px' }}>
            Thanks for rating!
          </div>
        )}
      </div>
    </div>
  );
}
