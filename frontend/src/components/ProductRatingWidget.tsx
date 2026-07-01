'use client';

import React, { useState, useEffect } from 'react';
import { getBackendUrl } from '@/utils/api';

interface Props {
  productId: string;
  productSlug: string;
  categorySlug: string;
}

export default function ProductRatingWidget({ productId, productSlug, categorySlug }: Props) {
  // Generate deterministic catalog number and brand name based on product details
  const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const catalogNo = 1000000 + (hash % 900000);

  const getBrandName = () => {
    if (categorySlug === 'anatomy-models') return '3B Scientific - Germany';
    if (categorySlug === 'medical-simulators') return 'Simulaids - USA';
    return 'Gaumard Scientific - USA';
  };

  // Default baselines before database values load
  const initialAvg = parseFloat((4.3 + (hash % 7) * 0.1).toFixed(1));
  const initialCount = 120 + (hash % 73) * 8;

  const [avgRating, setAvgRating] = useState(initialAvg);
  const [reviewsCount, setReviewsCount] = useState(initialCount);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [rated, setRated] = useState(false);
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
    if (!visitorId) return;

    const fetchRatingInfo = async () => {
      try {
        const res = await fetch(getBackendUrl(`http://127.0.0.1:5000/api/public/products/${productId}/rating-info?visitorId=${visitorId}`));
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setAvgRating(data.ratingAverage);
            setReviewsCount(data.ratingCount);
            if (data.userRating) {
              setUserRating(data.userRating);
              setRated(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching rating info from database:', error);
      }
    };

    fetchRatingInfo();
  }, [productId, visitorId]);

  // 3. Handle rating submission and update
  const handleRate = async (rating: number) => {
    if (!visitorId) return;

    // Optimistically update the UI rating
    const previousUserRating = userRating;
    const previousRated = rated;

    setUserRating(rating);
    setRated(true);

    try {
      const res = await fetch(getBackendUrl(`http://127.0.0.1:5000/api/public/products/${productId}/rate`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visitorId, rating }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAvgRating(data.ratingAverage);
          setReviewsCount(data.ratingCount);
          setUserRating(data.userRating);
        } else {
          // Revert on API error
          setUserRating(previousUserRating);
          setRated(previousRated);
        }
      } else {
        // Revert on HTTP error
        setUserRating(previousUserRating);
        setRated(previousRated);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      setUserRating(previousUserRating);
      setRated(previousRated);
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return Array.from({ length: 5 }).map((_, idx) => {
      const starValue = idx + 1;
      // For interactive rating: show hover value if hovering, otherwise the user's selected rating
      // For read-only average rating: show filled stars up to the average rating
      const isFilled = interactive
        ? starValue <= (hoverRating ?? userRating ?? 0)
        : starValue <= Math.floor(rating);
      const isHalf = !interactive && !isFilled && rating - idx >= 0.4;

      return (
        <span
          key={idx}
          onClick={() => interactive && handleRate(starValue)}
          onMouseEnter={() => interactive && setHoverRating(starValue)}
          onMouseLeave={() => interactive && setHoverRating(null)}
          style={{
            cursor: interactive ? 'pointer' : 'default',
            color: isFilled || isHalf ? '#f59e0b' : '#e2e8f0',
            fontSize: interactive ? '1.45rem' : '1.15rem',
            marginRight: '3px',
            display: 'inline-block',
            transition: 'transform 0.15s ease, color 0.15s ease',
            transform: interactive && hoverRating === starValue ? 'scale(1.25)' : 'none',
          }}
        >
          {isFilled ? '★' : isHalf ? '⯪' : '★'}
        </span>
      );
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>

      {/* Average Rating Display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {renderStars(avgRating)}
        </div>
        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
          {avgRating.toFixed(1)} <span style={{ color: '#64748b', fontWeight: 500 }}>({reviewsCount})</span>
        </span>
      </div>

      {/* Interactive Rating Component */}
      <div style={{
        marginTop: '12px',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.5)',
        border: '1px dashed #cbd5e1',
        borderRadius: '10px',
        maxWidth: '240px',
      }}>
        <div style={{
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '6px'
        }}>
          {rated ? 'Change rating' : 'Rate it!'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', height: '24px' }}>
          {renderStars(5, true)}
        </div>
        {rated && (
          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>
            Thanks for rating!
          </div>
        )}
      </div>
    </div>
  );
}
