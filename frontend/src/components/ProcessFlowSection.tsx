'use client';

import React, { useEffect, useRef, useState } from 'react';

const PROCESS_STEPS = [
  {
    stepNumber: '1',
    title: 'PLAN',
    subTitle: 'Strategic Scope & Brief',
    description: 'Align curriculum, learner capacity, available space and budget with a practical implementation brief.',
    bgImage: '/solutions/solution_centre_planning.png',
  },
  {
    stepNumber: '2',
    title: 'DESIGN',
    subTitle: 'Layout & Zoning',
    description: 'Develop room zoning, workflows, services, AV/debriefing requirements and scalable layouts.',
    bgImage: '/solutions/solution_vr_immersive.png',
  },
  {
    stepNumber: '3',
    title: 'EQUIP',
    subTitle: 'Technology & Infrastructure',
    description: 'Curate and integrate simulators, task trainers, anatomy models, immersive technology and lab infrastructure.',
    bgImage: '/solutions/solution_medical_simulators.png',
  },
  {
    stepNumber: '4',
    title: 'TRAIN',
    subTitle: 'Faculty Preparation',
    description: 'Prepare faculty with system orientation, scenario delivery and debriefing support.',
    bgImage: '/solutions/solution_task_trainers.png',
  },
  {
    stepNumber: '5',
    title: 'SUPPORT',
    subTitle: 'Long-Term Assistance',
    description: 'Protect utilisation through responsive service, maintenance and ongoing guidance.',
    bgImage: '/solutions/solution_av_debriefing.png',
  },
];

export default function ProcessFlowSection() {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // JS Viewport Pinning State for 100% Guaranteed Sticky Pinning across all browsers
  const gridRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const [pinMode, setPinMode] = useState<'top' | 'fixed' | 'bottom'>('top');
  const [fixedStyle, setFixedStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const handleScrollAndPin = () => {
      // 1. Calculate Active Step based on distance to viewport center (45% from top)
      const viewportCenter = window.innerHeight * 0.45;
      let closestStep = 0;
      let minDistance = Infinity;

      stepRefs.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          const stepCenter = rect.top + rect.height / 2;
          const distance = Math.abs(viewportCenter - stepCenter);

          if (distance < minDistance) {
            minDistance = distance;
            closestStep = index;
          }
        }
      });

      setActiveStep(closestStep);

      // 2. JS Viewport Pinning algorithm for Left Image Frame
      if (!gridRef.current || !leftColRef.current) return;

      const gridRect = gridRef.current.getBoundingClientRect();
      const colRect = leftColRef.current.getBoundingClientRect();
      const topOffset = 140; // px below top of screen
      const imageBoxHeight = 420; // approximate frame height

      if (gridRect.top > topOffset) {
        setPinMode('top');
      } else if (gridRect.bottom < topOffset + imageBoxHeight) {
        setPinMode('bottom');
      } else {
        setPinMode('fixed');
        setFixedStyle({
          position: 'fixed',
          top: `${topOffset}px`,
          left: `${colRect.left}px`,
          width: `${colRect.width}px`,
          zIndex: 40,
        });
      }
    };

    window.addEventListener('scroll', handleScrollAndPin, { passive: true });
    window.addEventListener('resize', handleScrollAndPin, { passive: true });
    handleScrollAndPin();

    return () => {
      window.removeEventListener('scroll', handleScrollAndPin);
      window.removeEventListener('resize', handleScrollAndPin);
    };
  }, []);

  return (
    <section style={{
      width: '100%',
      padding: '40px 16px 80px',
      background: '#ffffff',
      position: 'relative',
    }}>
      {/* Outer Card Container (Matching Lighter Clinical Mint Theme used across all sections) */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        borderRadius: '32px',
        position: 'relative',
        padding: '70px 32px 120px',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #f0fdfc 0%, #f8fafc 50%, #f0fdfa 100%)',
        border: '1px solid #ccfbf1',
        boxShadow: 'none',
      }}>

        {/* Top Header Block */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '820px',
          margin: '0 auto 80px',
          position: 'relative',
          zIndex: 10,
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '34px',
            borderRadius: '24px',
            background: 'rgba(10, 141, 147, 0.08)',
            border: '1px solid rgba(10, 141, 147, 0.25)',
            padding: '0 18px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#0a8d93',
            marginBottom: '24px',
            letterSpacing: '0.5px',
          }}>
            How we build your simulation centre
          </div>

          <h2 style={{
            fontSize: 'clamp(1.8rem, 4vw, 3rem)',
            fontWeight: 800,
            color: '#0f172a',
            lineHeight: 1.22,
            letterSpacing: '-0.025em',
            margin: 0,
            fontFamily: 'var(--font-display)',
          }}>
            From an Empty Space to a Faculty-Ready Simulation Centre
          </h2>
        </div>

        {/* 2-Column Sticky Layout */}
        <div
          ref={gridRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '48px',
            position: 'relative',
            zIndex: 10,
          }}
          className="docshield-steps-grid"
        >
          {/* LEFT COLUMN: 5-Span Column Track */}
          <div
            ref={leftColRef}
            style={{
              gridColumn: 'span 5',
              position: 'relative',
            }}
            className="sticky-col-wrapper"
          >
            {/* Image Box Wrapper with JS Viewport Pinning */}
            <div
              style={
                pinMode === 'fixed'
                  ? fixedStyle
                  : pinMode === 'bottom'
                  ? {
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      width: '100%',
                      zIndex: 20,
                    }
                  : {
                      position: 'relative',
                      width: '100%',
                      zIndex: 20,
                    }
              }
            >
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '400px',
                aspectRatio: '1 / 1',
                borderRadius: '24px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)',
                margin: '0 auto',
                background: '#ffffff',
              }}>
                {PROCESS_STEPS.map((step, idx) => (
                  <div
                    key={step.stepNumber}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '24px',
                      overflow: 'hidden',
                      opacity: activeStep === idx ? 1 : 0,
                      transition: 'opacity 700ms ease-in-out',
                      pointerEvents: activeStep === idx ? 'auto' : 'none',
                    }}
                  >
                    <img
                      src={step.bgImage}
                      alt={step.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: SCROLLABLE CLEAN STEPS LIST */}
          <div style={{
            gridColumn: 'span 7',
            display: 'flex',
            flexDirection: 'column',
            gap: '120px',
            paddingTop: '20px',
            paddingBottom: '60px',
          }} className="scrollable-col-wrapper">
            {PROCESS_STEPS.map((step, idx) => {
              const isActive = activeStep === idx;
              const textColor = '#0f172a';
              const descColor = '#475569';

              const badgeBg = isActive ? '#0a8d93' : 'rgba(10, 141, 147, 0.08)';
              const badgeBorder = isActive ? '1px solid #0a8d93' : '1px solid rgba(10, 141, 147, 0.25)';
              const badgeNumColor = isActive ? '#ffffff' : '#0a8d93';

              return (
                <div
                  key={step.stepNumber}
                  data-step-index={idx}
                  ref={(el) => {
                    stepRefs.current[idx] = el;
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '16px',
                    maxWidth: '520px',
                    opacity: isActive ? 1 : 0.45,
                    transition: 'opacity 500ms ease-in-out',
                  }}
                >
                  {/* Step Header: Circle Badge + Title */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                  }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: badgeBg,
                      border: badgeBorder,
                      boxShadow: isActive ? '0 4px 14px rgba(10, 141, 147, 0.25)' : 'none',
                      color: badgeNumColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      flexShrink: 0,
                      transform: isActive ? 'scale(1.08)' : 'scale(1)',
                      transition: 'all 400ms ease-in-out',
                    }}>
                      {step.stepNumber}
                    </div>

                    <h3 style={{
                      fontSize: 'clamp(1.5rem, 2.4vw, 2.1rem)',
                      fontWeight: 800,
                      color: textColor,
                      margin: 0,
                      lineHeight: 1.2,
                      fontFamily: 'var(--font-display)',
                    }}>
                      {step.title}
                    </h3>
                  </div>

                  {/* Mobile Image Display (Only visible on mobile screens) */}
                  <div className="mobile-step-img" style={{
                    width: '100%',
                    aspectRatio: '16 / 9',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    marginTop: '8px',
                    marginBottom: '8px',
                    border: '1px solid #e2e8f0',
                  }}>
                    <img
                      src={step.bgImage}
                      alt={step.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Description Paragraph */}
                  <p style={{
                    fontSize: 'clamp(1.02rem, 1.5vw, 1.18rem)',
                    color: descColor,
                    lineHeight: 1.6,
                    margin: 0,
                    fontWeight: 450,
                  }}>
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      <style jsx>{`
        @media (max-width: 868px) {
          .docshield-steps-grid {
            display: flex !important;
            flex-direction: column !important;
          }
          .sticky-col-wrapper {
            display: none !important;
          }
          .scrollable-col-wrapper {
            width: 100% !important;
            gap: 48px !important;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          .mobile-step-img {
            display: block !important;
          }
        }
        @media (min-width: 869px) {
          .mobile-step-img {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
