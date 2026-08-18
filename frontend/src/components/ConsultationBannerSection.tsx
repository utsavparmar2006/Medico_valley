'use client';

import React from 'react';
import Link from 'next/link';

export default function ConsultationBannerSection() {
  return (
    <section style={{
      width: '100%',
      padding: '90px 24px',
      background: '#ffffff',
      position: 'relative',
    }}>
      <div style={{
        maxWidth: '1160px',
        margin: '0 auto',
        background: '#ffffff',
        border: 'none',
        borderRadius: '28px',
        padding: '64px 48px',
        position: 'relative',
        overflow: 'hidden',
      }}>

        <div style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          position: 'relative',
          zIndex: 2,
        }}>
          {/* Sub-badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            background: 'rgba(10, 141, 147, 0.08)',
            borderRadius: '20px',
            border: '1px solid rgba(10, 141, 147, 0.18)',
          }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '2.5px',
              color: '#0a8d93',
              textTransform: 'uppercase',
            }}>
              EXPERT CONSULTATION &amp; PLANNING
            </span>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.9rem, 4vw, 2.75rem)',
            fontWeight: 800,
            color: '#0f172a',
            lineHeight: 1.2,
            letterSpacing: '-0.025em',
            margin: 0,
            fontFamily: 'var(--font-display)',
            maxWidth: '900px',
          }}>
            Planning a Simulation Centre or Skills Lab?
          </h2>

          <p style={{
            fontSize: '1.05rem',
            fontWeight: 400,
            color: '#475569',
            lineHeight: 1.68,
            maxWidth: '820px',
            margin: 0,
          }}>
            Share your learning goals, available space or BOQ. Our team will help you define the right layout, technology and implementation plan. MedicoValley is your trusted partner from planning to implementation.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '18px',
            flexWrap: 'wrap',
            marginTop: '16px',
          }}>
            <Link
              href="/simulation-centre"
              style={{
                background: 'linear-gradient(135deg, #0a8d93 0%, #086d71 100%)',
                color: '#ffffff',
                padding: '15px 34px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.95rem',
                textDecoration: 'none',
                boxShadow: '0 10px 28px rgba(10, 141, 147, 0.35)',
                transition: 'all 0.25s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span>Book a Free Consultation</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            <a
              href="tel:+919820939291"
              style={{
                background: '#f8fafc',
                border: '1.5px solid #0a8d93',
                color: '#0a8d93',
                padding: '15px 30px',
                borderRadius: '12px',
                fontWeight: 750,
                fontSize: '0.95rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.25s ease',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>Call +91 98209 39291</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
