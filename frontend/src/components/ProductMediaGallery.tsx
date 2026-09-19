'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from '@/utils/youtube';
import styles from '@/app/products/products.module.css';

interface Props {
  mediaUrls: string[];
  productName: string;
  youtubeUrl?: string;
}

interface MediaItem {
  type: 'image' | 'video' | 'youtube';
  url: string;
  embedUrl?: string;
  thumbUrl?: string;
}

export default function ProductMediaGallery({ mediaUrls, productName, youtubeUrl }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Build integrated list of media items
  const items: MediaItem[] = (mediaUrls || []).map((url) => ({
    type: url.endsWith('.mp4') ? 'video' : 'image',
    url,
  }));

  const ytEmbed = getYouTubeEmbedUrl(youtubeUrl);
  const ytThumb = getYouTubeThumbnail(youtubeUrl);

  if (ytEmbed) {
    items.push({
      type: 'youtube',
      url: youtubeUrl!,
      embedUrl: ytEmbed,
      thumbUrl: ytThumb || '',
    });
  }

  if (items.length === 0) {
    return (
      <div className={styles.mainMediaWrapper}>
        <span className={styles.noMediaText}>No media available</span>
      </div>
    );
  }

  // Ensure activeIndex is within bounds
  const safeIndex = activeIndex < items.length ? activeIndex : 0;
  const activeItem = items[safeIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={styles.gallerySection}>
      {/* Main Display Pane */}
      <div className={styles.mainMediaWrapper} style={{ position: 'relative' }}>
        {activeItem.type === 'youtube' && activeItem.embedUrl ? (
          <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '340px' }}>
            <iframe
              src={activeItem.embedUrl}
              title={`${productName} Video`}
              style={{ width: '100%', height: '100%', border: 0, borderRadius: '12px' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        ) : activeItem.type === 'video' ? (
          <video
            src={activeItem.url}
            controls
            className={styles.mainMedia}
          />
        ) : (
          <Image
            src={activeItem.url}
            alt={`${productName} Media`}
            fill
            priority={safeIndex === 0}
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: 'contain' }}
            className={styles.mainMedia}
          />
        )}

        {/* Gallery Navigation Arrows on Hero Image */}
        {items.length > 1 && (
          <>
            <button
              type="button"
              className={styles.galleryArrowLeft}
              onClick={handlePrev}
              aria-label="Previous media"
              title="Previous media"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              className={styles.galleryArrowRight}
              onClick={handleNext}
              aria-label="Next media"
              title="Next media"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails list */}
      {items.length > 1 && (
        <div className={styles.mediaThumbnails}>
          {items.map((item, index) => {
            const isActive = index === safeIndex;

            return (
              <div
                key={index}
                className={`${styles.thumb} ${isActive ? styles.thumbActive : ''}`}
                onClick={() => setActiveIndex(index)}
              >
                {item.type === 'youtube' ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0f172a', borderRadius: '6px', overflow: 'hidden' }}>
                    {item.thumbUrl ? (
                      <img
                        src={item.thumbUrl}
                        alt={`${productName} YouTube Video`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : null}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0,0,0,0.35)',
                    }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="#ef4444">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                  </div>
                ) : item.type === 'video' ? (
                  <div className={styles.thumbVideoIcon}>
                    <span>▶</span>
                  </div>
                ) : (
                  <Image
                    src={item.url}
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
