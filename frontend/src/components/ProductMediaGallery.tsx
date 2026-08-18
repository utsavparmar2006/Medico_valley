'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from '@/app/products/products.module.css';

interface Props {
  mediaUrls: string[];
  productName: string;
}

export default function ProductMediaGallery({ mediaUrls, productName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!mediaUrls || mediaUrls.length === 0) {
    return (
      <div className={styles.mainMediaWrapper}>
        <span className={styles.noMediaText}>No media available</span>
      </div>
    );
  }

  const activeUrl = mediaUrls[activeIndex];
  const isActiveVideo = activeUrl.endsWith('.mp4');

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? mediaUrls.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === mediaUrls.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={styles.gallerySection}>
      {/* Main Display Pane */}
      <div className={styles.mainMediaWrapper} style={{ position: 'relative' }}>
        {isActiveVideo ? (
          <video
            src={activeUrl}
            controls
            className={styles.mainMedia}
          />
        ) : (
          <Image
            src={activeUrl}
            alt={`${productName} Media`}
            fill
            priority={activeIndex === 0}
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: 'contain' }}
            className={styles.mainMedia}
          />
        )}

        {/* Gallery Navigation Arrows on Hero Image */}
        {mediaUrls.length > 1 && (
          <>
            <button
              type="button"
              className={styles.galleryArrowLeft}
              onClick={handlePrev}
              aria-label="Previous image"
              title="Previous image"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              className={styles.galleryArrowRight}
              onClick={handleNext}
              aria-label="Next image"
              title="Next image"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails list */}
      {mediaUrls.length > 1 && (
        <div className={styles.mediaThumbnails}>
          {mediaUrls.map((url, index) => {
            const isVideo = url.endsWith('.mp4');
            const isActive = index === activeIndex;

            return (
              <div
                key={index}
                className={`${styles.thumb} ${isActive ? styles.thumbActive : ''}`}
                onClick={() => setActiveIndex(index)}
              >
                {isVideo ? (
                  <div className={styles.thumbVideoIcon}>
                    <span>▶</span>
                  </div>
                ) : (
                  <Image
                    src={url}
                    alt={`${productName} thumbnail ${index + 1}`}
                    fill
                    sizes="80px"
                    style={{ objectFit: 'contain', padding: '6px' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
