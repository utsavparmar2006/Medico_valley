'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getYouTubeVideoId, getYouTubeEmbedUrl, getYouTubeThumbnail } from '@/utils/youtube';

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface Props {
  youtubeUrl?: string | null;
  title?: string;
  className?: string;
}

export default function YouTubePlayer({ youtubeUrl, title = 'Video Demonstration', className }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const playerInstanceRef = useRef<any>(null);

  const videoId = getYouTubeVideoId(youtubeUrl);
  const embedBase = getYouTubeEmbedUrl(youtubeUrl);
  const thumbUrl = getYouTubeThumbnail(youtubeUrl, 'hq');

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!window.YT) {
      const existingScript = document.getElementById('youtube-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
          document.head.appendChild(tag);
        }
      }
    }
  }, []);

  // Initialize YT.Player when isPlaying becomes true
  useEffect(() => {
    if (!isPlaying || !videoId || errorMessage) return;

    let isMounted = true;

    const initPlayer = () => {
      if (!isMounted || !playerContainerRef.current) return;

      try {
        if (window.YT && window.YT.Player) {
          // Clean up old instance if any
          if (playerInstanceRef.current && playerInstanceRef.current.destroy) {
            try {
              playerInstanceRef.current.destroy();
            } catch (_) {}
          }

          playerInstanceRef.current = new window.YT.Player(playerContainerRef.current, {
            videoId,
            playerVars: {
              autoplay: 1,
              playsinline: 1,
              rel: 0,
              modestbranding: 1,
              enablejsapi: 1,
              origin: typeof window !== 'undefined' ? window.location.origin : undefined,
            },
            events: {
              onError: (event: { data: number }) => {
                if (!isMounted) return;
                console.warn('YouTube Player error code:', event.data);
                if (event.data === 101 || event.data === 150) {
                  setErrorMessage(
                    'The owner of this video has restricted playback on external websites.'
                  );
                } else if (event.data === 100) {
                  setErrorMessage('The requested video is private or unavailable.');
                } else {
                  setErrorMessage('This video cannot be played in the embedded player.');
                }
              },
            },
          });
        }
      } catch (err) {
        console.error('Failed to initialize YouTube Player API:', err);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Check periodically for YT API readiness
      const interval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(interval);
          initPlayer();
        }
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 5000);

      return () => {
        isMounted = false;
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }

    return () => {
      isMounted = false;
      if (playerInstanceRef.current && playerInstanceRef.current.destroy) {
        try {
          playerInstanceRef.current.destroy();
        } catch (_) {}
      }
    };
  }, [isPlaying, videoId, errorMessage]);

  if (!videoId || !embedBase) return null;

  const directWatchUrl = `https://www.youtube.com/watch?v=${videoId}`;

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
      {errorMessage ? (
        /* Professional Industry-Standard Fallback Card when video owner disabled external embedding */
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>
            External Playback Restricted
          </h4>
          <p style={{ margin: '0 0 20px 0', fontSize: '0.875rem', color: '#94a3b8', maxWidth: '440px', lineHeight: 1.5 }}>
            {errorMessage}
          </p>
          <a
            href={directWatchUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              background: '#ef4444',
              color: '#ffffff',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            Watch on YouTube
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      ) : isPlaying ? (
        /* Video Container initialized by YouTube Player API */
        <div
          ref={playerContainerRef}
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        /* High-Performance Custom Facade with Verified Thumbnail and Responsive Play Button */
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

          {/* Semi-transparent dark overlay */}
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
              transition: 'transform 0.2s ease',
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
