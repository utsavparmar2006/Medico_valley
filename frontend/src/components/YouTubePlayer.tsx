'use client';

import React, { useState } from 'react';
import { getYouTubeVideoId, getYouTubeEmbedUrl, getYouTubeThumbnail } from '@/utils/youtube';

interface Props {
  youtubeUrl?: string | null;
  title?: string;
  className?: string;
}

export default function YouTubePlayer({ youtubeUrl, title = 'Video Demonstration', className }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);

  const videoId = getYouTubeVideoId(youtubeUrl);
  const embedBase = getYouTubeEmbedUrl(youtubeUrl);
  const thumbUrl = getYouTubeThumbnail(youtubeUrl, 'hq');

  if (!videoId || !embedBase) return null;

  // When user clicks the play button, autoplay inline immediately
  const embedSrc = `${embedBase}&autoplay=1`;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '880px',
        aspectRatio: '16/9',
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#0a192f',
        boxShadow: '0 10px 32px rgba(0, 0, 0, 0.12)',
        border: '1px solid #e2e8f0',
      }}
    >
      {isPlaying ? (
        <iframe
          src={embedSrc}
          title={title}
          style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          aria-label={`Play ${title}`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            padding: 0,
            margin: 0,
            background: 'transparent',
            cursor: 'pointer',
            display: 'block',
          }}
        >
          {thumbUrl && (
            <img
              src={thumbUrl}
              alt={title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          )}

          {/* Semi-transparent dark overlay for high contrast */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 100%)',
            }}
          />

          {/* Centered YouTube Play Button */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '68px',
              height: '48px',
              background: '#ef4444',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 22px rgba(239, 68, 68, 0.45)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#ffffff" style={{ marginLeft: '3px' }}>
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}
    </div>
  );
}
