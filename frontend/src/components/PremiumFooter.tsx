'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, type Variants } from 'framer-motion';
import { getBackendUrl } from '@/utils/api';
import styles from './PremiumFooter.module.css';

const LINKS = {
  products: [
    { label: 'Anatomy Models', href: '/products/anatomy-models' },
    { label: 'Medical Simulators', href: '/products/medical-simulators' },
    { label: 'Task Trainers', href: '/products/task-trainers' },
    { label: 'Virtual Reality', href: '#' },
    { label: 'Lab Equipment', href: '#' },
  ],
  company: [
    { label: 'Contact Us', href: '/contact-us' },
    { label: 'Global Partners', href: '#' },
    { label: 'Research & Innovation', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'News & Media', href: '#' },
  ],
  support: [
    { label: 'Help & FAQ', href: '#' },
    { label: 'Technical Support', href: '#' },
    { label: 'Product Catalogue', href: '#' },
    { label: 'Shipping Policy', href: '#' },
    { label: 'Privacy Policy', href: '#' },
  ],
};

const SOCIALS = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/medicovalley-enterprises/',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/share/1DEYDgF49w/',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@medicovalley?si=ThjyaYHFMSzfwEsJ',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 00-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0B1F3A" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/_medicovalley?igsh=MWRnam80N2l1dGsybw==',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export default function PremiumFooter() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const [productsLinks, setProductsLinks] = useState(LINKS.products);

  useEffect(() => {
    fetch(getBackendUrl('http://localhost:5000/api/public/categories'))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && data.success && Array.isArray(data.data)) {
          const items = data.data.map((cat: any) => ({
            label: cat.name,
            href: `/products/${cat.slug}`,
          }));
          if (items.length > 0) {
            setProductsLinks(items.slice(0, 5));
          }
        }
      })
      .catch(() => {
        // Silently retain hardcoded fallback links when backend server is offline or loading
      });
  }, []);

  const colVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: i * 0.08,
        ease: [0.25, 1, 0.5, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <footer ref={ref} className={styles.footer}>
      <div className={styles.container}>
        {/* ── MAIN ROW: 4 Column Layout ── */}
        <div className={styles.mainRow}>
          {/* Column 1: Brand & Contacts */}
          <motion.div
            className={styles.brandCol}
            custom={0}
            variants={colVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <div className={styles.brandLogo}>
              <img
                src="/logo-icon-only.png"
                alt="MedicoValley icon"
                style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
              />
              MedicoValley
            </div>
            <p className={styles.brandTagline}>
              Setting the global standard for high-fidelity medical simulation and clinical education. Precision in every model.
            </p>

            {/* Inline contact info */}
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.35 6.35l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                <a href="tel:+919768156266" style={{ color: 'inherit', textDecoration: 'none' }}>
                  <span>+91 97681 56266</span>
                </a>
              </div>
              <div className={styles.contactItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>info@medicovalley.in</span>
              </div>
              <div className={styles.contactItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className={styles.socials}>
              {SOCIALS.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target={s.href !== '#' ? '_blank' : undefined}
                  rel={s.href !== '#' ? 'noopener noreferrer' : undefined}
                  aria-label={s.label}
                  className={styles.socialIcon}
                  whileHover={{ scale: 1.15, y: -2 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Columns 2, 3, 4: Link Columns */}
          {[
            { title: 'Products', links: productsLinks },
            { title: 'Company', links: LINKS.company },
            { title: 'Support', links: LINKS.support },
          ].map((col, i) => (
            <motion.div
              key={col.title}
              className={styles.linkCol}
              custom={i + 1}
              variants={colVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
            >
              <h4 className={styles.colTitle}>{col.title}</h4>
              <ul className={styles.colList}>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className={styles.colLink}>
                      <span className={styles.colLinkArrow}>›</span>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* ── BOTTOM BAR ── */}
        <div className={styles.bottomBar}>
          <div className={styles.bottomLeft}>
            <p className={styles.copyright}>
              © {new Date().getFullYear()} Medico Valley Pvt. Ltd. All rights reserved.
            </p>
          </div>
          <div className={styles.bottomLinks}>
            <a href="#" className={styles.bottomLink}>Privacy Policy</a>
            <span className={styles.bottomSep}>·</span>
            <a href="#" className={styles.bottomLink}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

