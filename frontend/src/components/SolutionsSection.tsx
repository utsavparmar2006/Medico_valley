'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { getBackendUrl } from '@/utils/api';
import styles from './SolutionsSection.module.css';

gsap.registerPlugin(ScrollTrigger);

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
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [solutionsList, setSolutionsList] = useState<SolutionItem[]>(SOLUTIONS);

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

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // Only apply GSAP scroll pinning on screens >= 1024px
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    if (!isDesktop) return;

    const getScrollAmount = () => -(track.scrollWidth - window.innerWidth);

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: getScrollAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 0.8,
          start: 'top 95px',
          end: () => `+=${Math.abs(getScrollAmount())}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const index = Math.min(
              Math.floor(self.progress * solutionsList.length),
              solutionsList.length - 1
            );
            setActiveCardIndex(index);
          },
        },
      });
    }, section);

    return () => ctx.revert();
  }, [solutionsList]);

  const scrollToCard = (index: number) => {
    setActiveCardIndex(index);
    if (trackRef.current) {
      const cardElements = trackRef.current.children;
      if (cardElements[index]) {
        cardElements[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  };

  const handleTrackScroll = () => {
    if (trackRef.current) {
      const isMobile = window.matchMedia('(max-width: 1023px)').matches;
      if (!isMobile) return;
      const scrollLeft = trackRef.current.scrollLeft;
      const cardWidth = trackRef.current.children[0]?.clientWidth || 300;
      const newIndex = Math.min(
        Math.round(scrollLeft / (cardWidth + 16)),
        solutionsList.length - 1
      );
      if (newIndex !== activeCardIndex && newIndex >= 0) {
        setActiveCardIndex(newIndex);
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      className={styles.solutionsSection}
    >
      {/* Ambient background light glow */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(10, 141, 147, 0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Section Header */}
      <div style={{
        maxWidth: '1320px',
        margin: '0 auto 20px',
        padding: '0 24px',
        width: '100%',
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

      {/* Horizontal Scroll Track */}
      <div
        ref={trackRef}
        onScroll={handleTrackScroll}
        className={styles.solutionsTrack}
      >
        {solutionsList.map((item, idx) => (
          <div
            key={idx}
            className={`${styles.solutionCard} ${activeCardIndex === idx ? styles.solutionCardActive : ''}`}
          >
            {/* Top Crisp Image Header Banner */}
            <div style={{
              width: '100%',
              height: '145px',
              position: 'relative',
              overflow: 'hidden',
              background: '#f8fafc',
            }}>
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 340px"
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.15) 0%, rgba(15, 23, 42, 0.45) 100%)',
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

            {/* Bottom Content Body */}
            <div style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              flex: 1,
            }}>
              <div>
                <h3 style={{
                  fontSize: '1.12rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1.25,
                  margin: '0 0 6px 0',
                  fontFamily: 'var(--font-display)',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '0.84rem',
                  color: '#475569',
                  lineHeight: 1.45,
                  margin: 0,
                }}>
                  {item.description}
                </p>
              </div>

              <Link
                href={item.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 750,
                  color: '#0a8d93',
                  background: 'rgba(10, 141, 147, 0.08)',
                  border: '1px solid rgba(10, 141, 147, 0.25)',
                  textDecoration: 'none',
                  transition: 'all 0.25s ease',
                  padding: '9px 16px',
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

      {/* Mobile Controls Row */}
      <div className={styles.mobileNavRow}>
        <div className={styles.mobileDots}>
          {solutionsList.map((_, idx) => (
            <div
              key={idx}
              onClick={() => scrollToCard(idx)}
              className={`${styles.mobileDot} ${activeCardIndex === idx ? styles.mobileDotActive : ''}`}
            />
          ))}
        </div>

        <div className={styles.mobileCounter}>
          0{activeCardIndex + 1} / 0{solutionsList.length}
        </div>

        <div className={styles.mobileArrows}>
          <button
            onClick={() => scrollToCard(Math.max(0, activeCardIndex - 1))}
            className={styles.mobileArrowBtn}
            disabled={activeCardIndex === 0}
            style={{ opacity: activeCardIndex === 0 ? 0.35 : 1 }}
            aria-label="Previous card"
          >
            ‹
          </button>
          <button
            onClick={() => scrollToCard(Math.min(solutionsList.length - 1, activeCardIndex + 1))}
            className={styles.mobileArrowBtn}
            disabled={activeCardIndex === solutionsList.length - 1}
            style={{ opacity: activeCardIndex === solutionsList.length - 1 ? 0.35 : 1 }}
            aria-label="Next card"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
