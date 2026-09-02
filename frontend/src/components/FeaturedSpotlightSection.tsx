'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { getBackendUrl } from '@/utils/api';
import styles from './FeaturedSpotlightSection.module.css';

interface SpotlightData {
  _id: string;
  isActive: boolean;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  features: string[];
  showPrimaryBtn: boolean;
  primaryBtnText: string;
  primaryBtnHref: string;
  showSecondaryBtn: boolean;
  secondaryBtnText: string;
  secondaryBtnHref: string;
  showQuoteBtn: boolean;
  quoteBtnText: string;
}

export default function FeaturedSpotlightSection() {
  const [spotlight, setSpotlight] = useState<SpotlightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quoteOpen, setQuoteOpen] = useState(false);

  useEffect(() => {
    async function fetchSpotlight() {
      try {
        const url = getBackendUrl('http://localhost:5001/api/public/spotlight');
        const res = await fetch(`${url}?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        }).catch(() => null);
        if (res && res.ok) {
          const data = await res.json().catch(() => null);
          if (data && data.success && data.data) {
            setSpotlight(data.data);
          }
        }
      } catch {
        // Silently fail — section simply won't render
      } finally {
        setLoading(false);
      }
    }
    fetchSpotlight();
  }, []);

  // Render nothing if no active spotlight
  if (loading || !spotlight) return null;

  const hasAnyButton = spotlight.showPrimaryBtn || spotlight.showSecondaryBtn || spotlight.showQuoteBtn;

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        {/* Decorative side organic shape accents matching reference */}
        <div className={styles.leftSideShape} aria-hidden="true" />
        <div className={styles.rightSideShapeTop} aria-hidden="true" />
        <div className={styles.rightSideShapeBottom} aria-hidden="true" />

        <div className={styles.inner}>
          {/* LEFT — Product Image Showcase */}
          <motion.div
            className={styles.imageWrap}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className={styles.imageCard}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {spotlight.imageUrl ? (
                <Image
                  src={spotlight.imageUrl}
                  alt={spotlight.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={styles.productImage}
                  priority
                  unoptimized
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <span className="material-symbols-outlined" style={{ fontSize: '80px', color: 'rgba(12,143,151,0.2)' }}>
                    inventory_2
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* RIGHT — Product Details & Actions */}
          <motion.div
            className={styles.content}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          >
            {/* Top Brand Kicker */}
            <div className={styles.kicker}>
              <span className={styles.kickerText}>
                {spotlight.badge ? spotlight.badge : 'NEW FROM MEDICOVALLEY'}
              </span>
            </div>

            {/* Product Title */}
            <h2 className={styles.title}>{spotlight.title}</h2>

            {/* Subtitle / Tagline */}
            {spotlight.subtitle && (
              <p className={styles.subtitle}>{spotlight.subtitle}</p>
            )}

            {/* Description */}
            {spotlight.description && (
              <p className={styles.description}>{spotlight.description}</p>
            )}

            {/* Key Features with Clean Checkmarks */}
            {spotlight.features && spotlight.features.length > 0 && (
              <ul className={styles.featureList}>
                {spotlight.features.map((feat, i) => (
                  <li key={i} className={styles.featureItem}>
                    <span className={styles.featureCheck} aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7L5.5 10L11.5 4" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Status Pill Badge (e.g. COMING SOON / NEW LAUNCH) */}
            {spotlight.badge && (
              <div className={styles.badgeWrapper}>
                <span className={styles.pillBadge}>{spotlight.badge}</span>
              </div>
            )}

            {/* CTA Action Buttons */}
            {hasAnyButton && (
              <div className={styles.btnRow}>
                {spotlight.showPrimaryBtn && spotlight.primaryBtnHref && (
                  <Link href={spotlight.primaryBtnHref} className={styles.primaryBtn}>
                    {spotlight.primaryBtnText || 'View Product'}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}

                {spotlight.showSecondaryBtn && (
                  <a
                    href={spotlight.secondaryBtnHref || '#'}
                    target={spotlight.secondaryBtnHref ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className={styles.secondaryBtn}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    {spotlight.secondaryBtnText || 'Download Catalogue'}
                  </a>
                )}

                {spotlight.showQuoteBtn && (
                  <button
                    onClick={() => setQuoteOpen(true)}
                    className={styles.quoteBtn}
                    type="button"
                  >
                    {spotlight.quoteBtnText || 'Request a Quote'}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Lightweight inline quote modal */}
      {quoteOpen && (
        <div className={styles.modalOverlay} onClick={() => setQuoteOpen(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setQuoteOpen(false)} aria-label="Close">✕</button>
            <h3 className={styles.modalTitle}>Request a Quote</h3>
            <p className={styles.modalSubtitle}>
              Interested in <strong>{spotlight.title}</strong>? Fill in the form on our contact page and our team will get back to you within 24 hours.
            </p>
            <Link href="/contact-us" className={styles.modalCta} onClick={() => setQuoteOpen(false)}>
              Go to Contact Page
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
