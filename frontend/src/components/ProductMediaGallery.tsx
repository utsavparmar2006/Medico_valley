'use client';

import React, { useState } from 'react';
import styles from '@/app/products/products.module.css';

interface Props {
  mediaUrls: string[];
  productName: string;
}

export default function ProductMediaGallery({ mediaUrls, productName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!mediaUrls || mediaUrls.length === 0) {
    return (
      <div className={styles.mainMediaWrapper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0' }}>
        <span style={{ color: '#64748b' }}>No media available</span>
      </div>
    );
  }

  const activeUrl = mediaUrls[activeIndex];
  const isActiveVideo = activeUrl.endsWith('.mp4');

  return (
    <div className={styles.gallerySection}>
      {/* Main Display Pane */}
      <div className={styles.mainMediaWrapper}>
        {isActiveVideo ? (
          <video
            src={activeUrl}
            controls
            className={styles.mainMedia}
            style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
          />
        ) : (
          <img
            src={activeUrl}
            alt={`${productName} Media`}
            className={styles.mainMedia}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
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
                  <img src={url} alt={`${productName} thumbnail ${index + 1}`} style={{ width: '100%', height: '100%' }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
