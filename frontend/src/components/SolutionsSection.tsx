'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { getBackendUrl } from '@/utils/api';
import styles from './SolutionsSection.module.css';

interface SolutionItem {
  title: string;
  category: string;
  description: string;
  initials: string;
  ctaText: string;
  href: string;
  imageUrl: string;
}

export default function SolutionsSection() {
  const [solutionsList, setSolutionsList] = useState<SolutionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);
  const isInteractingRef = useRef(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mouse Drag State
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);

  useEffect(() => {
    async function fetchSolutions() {
      try {
        const targetUrl = getBackendUrl('http://localhost:5001/api/public/solutions');
        const res = await fetch(targetUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setSolutionsList(data.data);
          }
        }
      } catch (err) {
        console.warn('Could not fetch solutions from server:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSolutions();
  }, []);

  // Continuous Auto-Scroll Engine with seamless wrapping & mobile subpixel accumulator
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    scrollPosRef.current = track.scrollLeft;

    let animationFrameId: number;

    const autoScroll = () => {
      if (!isInteractingRef.current && track) {
        scrollPosRef.current += 1.0;
        const halfWidth = track.scrollWidth / 2;
        if (halfWidth > 0 && scrollPosRef.current >= halfWidth) {
          scrollPosRef.current -= halfWidth;
        }
        track.scrollLeft = scrollPosRef.current;
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [solutionsList]);

  // Pause auto-scroll on interaction, then auto-resume smoothly after 2.5s
  const pauseAndAutoResume = useCallback(() => {
    isInteractingRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      if (trackRef.current) {
        scrollPosRef.current = trackRef.current.scrollLeft;
      }
      isInteractingRef.current = false;
    }, 2500);
  }, []);

  // Manual Arrow Navigation
  const handleScroll = (direction: 'left' | 'right') => {
    const track = trackRef.current;
    if (!track) return;
    pauseAndAutoResume();
    const cardStep = 410; // Card width (385px) + gap (25px)
    track.scrollBy({
      left: direction === 'right' ? cardStep : -cardStep,
      behavior: 'smooth',
    });
    setTimeout(() => {
      if (trackRef.current) {
        scrollPosRef.current = trackRef.current.scrollLeft;
      }
    }, 350);
  };

  // Mouse Drag Handlers for Desktop Drag-to-Scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    const track = trackRef.current;
    if (!track) return;
    isDraggingRef.current = true;
    isInteractingRef.current = true;
    startXRef.current = e.pageX - track.offsetLeft;
    scrollLeftStartRef.current = track.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    trackRef.current.scrollLeft = scrollLeftStartRef.current - walk;
    scrollPosRef.current = trackRef.current.scrollLeft;
  };

  const handleMouseUpOrLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      pauseAndAutoResume();
    }
  };

  const handleTrackScroll = () => {
    if (isInteractingRef.current && trackRef.current) {
      scrollPosRef.current = trackRef.current.scrollLeft;
    }
  };

  // Duplicate list to support seamless infinite auto-scrolling
  const listToRender = [...solutionsList, ...solutionsList, ...solutionsList, ...solutionsList];

  return (
    <section id="solutions" className={styles.solutionsSection}>
      {/* Section Header (Centered) */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto 32px',
        padding: '0 20px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
      }}>
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 800,
          letterSpacing: '3px',
          color: '#0a8d93',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: '6px',
        }}>
          TAILORED SOLUTIONS
        </span>
        <h2 style={{
          fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
          fontWeight: 800,
          color: '#0f172a',
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          margin: '0 0 8px 0',
          fontFamily: 'var(--font-display)',
        }}>
          Choose the Solution That Fits Your Training Goals
        </h2>
        <p style={{
          fontSize: '0.92rem',
          fontWeight: 400,
          color: '#475569',
          lineHeight: 1.5,
          margin: '0 auto',
          maxWidth: '780px',
        }}>
          Whether you are building a new facility, upgrading an existing lab or sourcing a specific training solution, MedicoValley helps you move from requirement to implementation with clarity.
        </p>
      </div>

      {/* Interactive Auto-Scrolling Slider Track */}
      {loading ? (
        <div style={{ textAlign: 'center', width: '100%', color: '#94a3b8', padding: '60px 20px', fontSize: '1rem' }}>
          Loading solutions...
        </div>
      ) : solutionsList.length > 0 ? (
        <div className={styles.solutionsSliderContainer}>
          <div
            ref={trackRef}
            className={styles.solutionsTrack}
            onMouseEnter={() => { isInteractingRef.current = true; }}
            onMouseLeave={() => {
              handleMouseUpOrLeave();
              isInteractingRef.current = false;
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onScroll={handleTrackScroll}
            onTouchStart={() => { isInteractingRef.current = true; }}
            onTouchMove={() => { isInteractingRef.current = true; }}
            onTouchEnd={pauseAndAutoResume}
            onTouchCancel={pauseAndAutoResume}
          >
            {listToRender.map((item, idx) => (
              <div
                key={`${item.title}-${idx}`}
                className={styles.solutionCard}
              >
                {/* Top Expanded Image Banner */}
                <div className={styles.cardImageWrap}>
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center',
                      pointerEvents: 'none',
                    }}
                  />
                  <div className={styles.cardImageOverlay} />

                  {/* Category Tag & Initials Overlay */}
                  <div className={styles.cardHeaderOverlay}>
                    <span className={styles.categoryTag}>
                      {item.category}
                    </span>

                    <div className={styles.initialsBadge}>
                      {item.initials}
                    </div>
                  </div>
                </div>

                {/* Bottom Content Body (Title & CTA Button) */}
                <div className={styles.cardContent}>
                  <div>
                    <h3 className={styles.cardTitle}>
                      {item.title}
                    </h3>
                  </div>

                  <Link
                    href={item.href}
                    className={styles.cardCtaBtn}
                  >
                    <span>{item.ctaText}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', width: '100%', color: '#64748b', padding: '60px 20px', fontSize: '1.05rem', fontWeight: 500 }}>
          No tailored solutions available at the moment.
        </div>
      )}
    </section>
  );
}
