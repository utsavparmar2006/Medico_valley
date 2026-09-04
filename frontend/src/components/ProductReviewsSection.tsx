'use client';

import React, { useState, useEffect } from 'react';
import { getBackendUrl } from '@/utils/api';

interface ReviewItem {
  _id: string;
  reviewerName: string;
  reviewerEmail?: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
}

interface Breakdown {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

interface Props {
  productId: string;
  productName: string;
}

export default function ProductReviewsSection({ productId, productName }: Props) {
  const [ratingAverage, setRatingAverage] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<Breakdown>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [formRating, setFormRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewerName, setReviewerName] = useState<string>('');
  const [reviewerEmail, setReviewerEmail] = useState<string>('');
  const [reviewTitle, setReviewTitle] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>('');
  const [submitError, setSubmitError] = useState<string>('');

  // Fetch live reviews and breakdown on mount
  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(getBackendUrl(`http://127.0.0.1:5001/api/public/products/${productId}/reviews`));
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRatingAverage(typeof data.ratingAverage === 'number' ? data.ratingAverage : 0);
          setRatingCount(typeof data.ratingCount === 'number' ? data.ratingCount : 0);
          if (data.breakdown) setBreakdown(data.breakdown);
          if (Array.isArray(data.reviews)) setReviews(data.reviews);
        }
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage('');
    setSubmitError('');

    if (!reviewerName.trim() || !reviewerEmail.trim() || !reviewComment.trim()) {
      setSubmitError('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    let visitorId = '';
    if (typeof window !== 'undefined') {
      visitorId = localStorage.getItem('visitor_id') || '';
    }

    try {
      const res = await fetch(getBackendUrl(`http://127.0.0.1:5001/api/public/products/${productId}/reviews`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerName,
          reviewerEmail,
          rating: formRating,
          title: reviewTitle,
          comment: reviewComment,
          visitorId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitMessage('Thank you! Your review has been submitted.');
        setReviewerName('');
        setReviewerEmail('');
        setReviewTitle('');
        setReviewComment('');
        setFormRating(5);
        if (data.ratingAverage) setRatingAverage(data.ratingAverage);
        if (data.ratingCount) setRatingCount(data.ratingCount);
        if (data.breakdown) setBreakdown(data.breakdown);

        // Append new review if returned
        if (data.data) {
          setReviews((prev) => [data.data, ...prev]);
        }
        setTimeout(() => setIsFormOpen(false), 2000);
      } else {
        setSubmitError(data.message || 'Failed to submit review.');
      }
    } catch (err: any) {
      setSubmitError('Error submitting review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, size = 18, interactive = false) => {
    return Array.from({ length: 5 }).map((_, idx) => {
      const starValue = idx + 1;
      const isFilled = interactive ? starValue <= (hoverRating ?? formRating) : starValue <= Math.round(rating);

      return (
        <span
          key={idx}
          onClick={() => interactive && setFormRating(starValue)}
          onMouseEnter={() => interactive && setHoverRating(starValue)}
          onMouseLeave={() => interactive && setHoverRating(null)}
          style={{
            cursor: interactive ? 'pointer' : 'default',
            marginRight: '3px',
            display: 'inline-flex',
            transition: 'transform 0.15s ease',
            transform: interactive && hoverRating === starValue ? 'scale(1.25)' : 'none',
          }}
        >
          <svg width={size} height={size} viewBox="0 0 24 24" fill={isFilled ? '#f59e0b' : '#cbd5e1'}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </span>
      );
    });
  };

  return (
    <div style={{
      width: '100%',
      marginTop: '48px',
      padding: '40px 0',
      borderTop: '1px solid #e2e8f0',
      boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '36px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '2px', color: '#0a8d93', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              REVIEWS & RATINGS
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'var(--font-display)' }}>
              Customer Experience & Ratings
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            style={{
              background: isFormOpen ? '#f1f5f9' : 'linear-gradient(135deg, #0a8d93 0%, #086d71 100%)',
              color: isFormOpen ? '#0f172a' : '#ffffff',
              border: isFormOpen ? '1px solid #cbd5e1' : 'none',
              padding: '12px 22px',
              borderRadius: '12px',
              fontWeight: 750,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: isFormOpen ? 'none' : '0 4px 16px rgba(10, 141, 147, 0.3)',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>{isFormOpen ? 'Close Review Form' : 'Write a Review'}</span>
            <span style={{ fontSize: '1.1rem' }}>{isFormOpen ? '✕' : '✍️'}</span>
          </button>
        </div>

        {/* Rating Breakdown & Summary Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '24px',
          padding: '36px',
          marginBottom: '40px',
        }}>
          {/* Left: Score Card */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', paddingRight: '24px', borderRight: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '3.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, fontFamily: 'var(--font-display)' }}>
              {ratingAverage.toFixed(1)}
            </div>
            <div style={{ margin: '12px 0 6px 0', display: 'flex', alignItems: 'center', gap: '2px' }}>
              {renderStars(ratingAverage, 22)}
            </div>
            <div style={{ fontSize: '0.92rem', color: '#64748b', fontWeight: 600 }}>
              Based on {ratingCount} Ratings &amp; Reviews
            </div>
          </div>

          {/* Right: Star Breakdown Progress Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const pct = (breakdown as any)[star] || 0;
              return (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', width: '32px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    {star} <span style={{ color: '#f59e0b' }}>★</span>
                  </div>
                  <div style={{ flex: 1, height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: star >= 4 ? 'linear-gradient(90deg, #0a8d93 0%, #00BFA6 100%)' : '#f59e0b',
                      borderRadius: '5px',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', width: '40px', textAlign: 'right' }}>
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expandable Review Form */}
        {isFormOpen && (
          <form
            onSubmit={handleSubmitReview}
            style={{
              background: '#ffffff',
              border: '2px solid #0a8d93',
              borderRadius: '20px',
              padding: '32px',
              marginBottom: '40px',
              boxShadow: '0 12px 36px rgba(10, 141, 147, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'var(--font-display)' }}>
              Write a Review for {productName}
            </h3>

            {/* Star Rating Picker */}
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 750, color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                Your Rating <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {renderStars(5, 26, true)}
                <span style={{ marginLeft: '12px', fontSize: '0.9rem', fontWeight: 700, color: '#0a8d93' }}>
                  {formRating} out of 5 stars
                </span>
              </div>
            </div>

            {/* Name + Email Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.88rem', fontWeight: 750, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                  Your Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Sharma"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.88rem', fontWeight: 750, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                  Your Email Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rajesh@medical.edu"
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Title & Comment */}
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 750, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                Review Headline (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Excellent build quality for clinical training"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.92rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 750, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                Your Review Comment <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Share details about product accuracy, durability, and practical utility for students or faculty..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.92rem',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            {submitMessage && (
              <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', borderRadius: '10px', fontWeight: 650, fontSize: '0.9rem' }}>
                {submitMessage}
              </div>
            )}

            {submitError && (
              <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '10px', fontWeight: 650, fontSize: '0.9rem' }}>
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: 'fit-content',
                background: 'linear-gradient(135deg, #0a8d93 0%, #00BFA6 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '12px',
                fontWeight: 750,
                fontSize: '0.95rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: '0 6px 20px rgba(10, 141, 147, 0.3)',
              }}
            >
              {isSubmitting ? 'Submitting Review...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Customer Reviews List */}
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '20px', fontFamily: 'var(--font-display)' }}>
            Verified Customer Feedback ({reviews.length})
          </h3>

          {reviews.length === 0 ? (
            <div style={{ padding: '40px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', textAlign: 'center', color: '#64748b' }}>
              No written reviews yet. Be the first to write a review for {productName}!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0a8d93 0%, #086d71 100%)',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {rev.reviewerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.96rem' }}>
                          {rev.reviewerName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#0a8d93', fontWeight: 650 }}>
                          Verified Institutional Buyer
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {renderStars(rev.rating, 16)}
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {rev.title && (
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 750, color: '#0f172a', margin: '0 0 6px 0' }}>
                      {rev.title}
                    </h4>
                  )}
                  <p style={{ fontSize: '0.94rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
