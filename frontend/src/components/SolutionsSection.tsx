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

const SOLUTIONS: SolutionItem[] = [
  {
    title: 'Simulation Centre Planning & Design',
    category: 'FLAGSHIP SERVICE',
    description: 'Create efficient, future-ready learning spaces from concept and layout to integration and handover.',
    initials: 'PS',
    ctaText: 'Plan Your Centre',
    href: '/simulation-centre',
    imageUrl: '/solutions/solution_centre_planning.png',
  },
  {
    title: 'Anatomy Models',
    category: 'ANATOMY',
    description: 'Make complex anatomy easier to see, understand and teach with accurate 3D learning aids.',
    initials: 'AM',
    ctaText: 'Explore Anatomy Models',
    href: '/products/anatomy-models',
    imageUrl: '/solutions/solution_anatomy_models.png',
  },
  {
    title: 'Medical Simulators',
    category: 'SIMULATORS',
    description: 'Build clinical reasoning, teamwork and decision-making in safe, realistic scenarios.',
    initials: 'MS',
    ctaText: 'Explore Medical Simulators',
    href: '/products/medical-simulators',
    imageUrl: '/solutions/solution_medical_simulators.png',
  },
  {
    title: 'Task Trainers',
    category: 'TASK TRAINERS',
    description: 'Develop procedural confidence through deliberate, repeatable hands-on practice.',
    initials: 'TT',
    ctaText: 'Explore Task Trainers',
    href: '/products/task-trainers',
    imageUrl: '/solutions/solution_task_trainers.png',
  },
  {
    title: 'VR, AR & Immersive Learning',
    category: 'INNOVATION',
    description: 'Extend access to interactive clinical learning, visualisation and scenario practice.',
    initials: 'VR',
    ctaText: 'Explore Digital Learning',
    href: '/products',
    imageUrl: '/solutions/solution_vr_immersive.png',
  },
];

export default function SolutionsSection() {
  const [solutionsList, setSolutionsList] = useState<SolutionItem[]>(SOLUTIONS);
  const trackRef = useRef<HTMLDivElement>(null);
  const isInteractingRef = useRef(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mouse Drag State
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);

  useEffect(() => {
    async function fetchSolutions() {
      try {
        const targetUrl = getBackendUrl('http://localhost:5000/api/public/solutions');
        const res = await fetch(targetUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setSolutionsList(data.data);
          }
        }
      } catch (err) {
        console.warn('Backend server unreachable, using default solutions list.');
      }
    }
    fetchSolutions();
  }, []);

  // Continuous Auto-Scroll Engine with seamless wrapping
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let animationFrameId: number;

    const autoScroll = () => {
      if (!isInteractingRef.current && track) {
        track.scrollLeft += 0.8;
        if (track.scrollLeft >= track.scrollWidth / 2) {
          track.scrollLeft -= track.scrollWidth / 2;
        }
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [solutionsList]);

  // Pause auto-scroll on interaction, then auto-resume smoothly after 3s
  const pauseAndAutoResume = useCallback(() => {
    isInteractingRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 3000);
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
  };

  const handleMouseUpOrLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      pauseAndAutoResume();
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
          onTouchStart={() => { isInteractingRef.current = true; }}
          onTouchEnd={() => { pauseAndAutoResume(); }}
        >
          {listToRender.map((item, idx) => (
            <div
              key={`${item.title}-${idx}`}
              className={styles.solutionCard}
            >
              {/* Top Expanded Image Banner */}
              <div style={{
                width: '100%',
                height: '290px',
                position: 'relative',
                overflow: 'hidden',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
              }}>
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
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0) 45%, rgba(15, 23, 42, 0.15) 100%)',
                }} />

                {/* Category Tag & Initials Overlay */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '14px',
                  right: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  zIndex: 2,
                }}>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    letterSpacing: '1.2px',
                    color: '#ffffff',
                    background: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(8px)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                  }}>
                    {item.category}
                  </span>

                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0a8d93',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-display)',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.12)',
                  }}>
                    {item.initials}
                  </div>
                </div>
              </div>

              {/* Bottom Content Body (Title & CTA Button) */}
              <div style={{
                padding: '18px 20px 20px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flex: 1,
              }}>
                <div>
                  <h3 style={{
                    fontSize: '1.18rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    lineHeight: 1.25,
                    margin: 0,
                    fontFamily: 'var(--font-display)',
                  }}>
                    {item.title}
                  </h3>
                </div>

                <Link
                  href={item.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 750,
                    color: '#0a8d93',
                    background: 'rgba(10, 141, 147, 0.08)',
                    border: '1px solid rgba(10, 141, 147, 0.25)',
                    textDecoration: 'none',
                    transition: 'all 0.25s ease',
                    padding: '9px 18px',
                    borderRadius: '10px',
                    width: 'fit-content',
                    marginTop: '14px',
                  }}
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
    </section>
  );
}
