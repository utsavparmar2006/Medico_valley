'use client';

import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import styles from '@/app/page.module.css';

gsap.registerPlugin(ScrollTrigger);

const hotspots = [
  {
    id: "brain",
    title: "Cerebrum & Sagittal Cut",
    desc: "Explorable sagittal division showcasing the cerebral cortex, cerebellum, and brainstem.",
    top: "12%",
    left: "50%",
  },
  {
    id: "heart",
    title: "2-Part Dissectible Heart",
    desc: "Removable anterior heart wall reveals ventricles, atria, and major valves with high-fidelity coloring.",
    top: "46%",
    left: "52%",
  },
  {
    id: "lungs",
    title: "Detachable Lung Lobes",
    desc: "Explorable lung halves showing bronchial tree, pulmonary vessels, and alveolar structure.",
    top: "42%",
    left: "40%",
  },
];

export default function ValuePropSection() {
  const valuePropSectionRef = useRef<HTMLDivElement>(null);
  const torsoScrollRef = useRef<HTMLDivElement>(null);
  const torsoParallaxRef = useRef<HTMLDivElement>(null);
  const torsoFloatRef = useRef<HTMLDivElement>(null);
  const radialGlowRef = useRef<HTMLDivElement>(null);
  const valuePropContentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!valuePropSectionRef.current || !torsoScrollRef.current) return;

      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!isReduced) {
        // Fade-in + scale reveal when section enters viewport
        gsap.fromTo(
          torsoScrollRef.current,
          { opacity: 0, scale: 0.92 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: valuePropSectionRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );

        // Optimized radial glow scroll pulse using GSAP ScrollTrigger
        if (radialGlowRef.current) {
          gsap.fromTo(
            radialGlowRef.current,
            { opacity: 0, scale: 0.9 },
            {
              opacity: 1,
              scale: 1.1,
              ease: "sine.inOut",
              scrollTrigger: {
                trigger: valuePropSectionRef.current,
                start: "top 80%",
                end: "bottom 20%",
                scrub: true,
              }
            }
          );
        }

        // Text reveal animation
        if (valuePropContentRef.current) {
          gsap.fromTo(
            valuePropContentRef.current,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: valuePropSectionRef.current,
                start: "top 80%",
                toggleActions: "play none none none"
              }
            }
          );
        }
      } else {
        // If reduced motion, show immediately
        gsap.set(torsoScrollRef.current, { opacity: 1, scale: 1 });
      }
    },
    { scope: valuePropSectionRef }
  );

  return (
    <section ref={valuePropSectionRef} className={styles.valuePropSection}>
      {/* Floating Medical Background Symbols */}
      <svg className={`${styles.bgSymbol} ${styles.symbolDna}`} width="60" height="160" viewBox="0 0 60 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 10C25 40 35 60 50 90C45 110 25 130 10 150" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M50 10C35 40 25 60 10 90C15 110 35 130 50 150" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="20" y1="30" x2="40" y2="30" stroke="currentColor" strokeWidth="1.5" />
        <line x1="26" y1="50" x2="34" y2="50" stroke="currentColor" strokeWidth="1.5" />
        <line x1="26" y1="110" x2="34" y2="110" stroke="currentColor" strokeWidth="1.5" />
        <line x1="20" y1="130" x2="40" y2="130" stroke="currentColor" strokeWidth="1.5" />
      </svg>

      <svg className={`${styles.bgSymbol} ${styles.symbolEcg}`} width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 30H40L45 15L52 45L58 5L64 35L67 30H110" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <svg className={`${styles.bgSymbol} ${styles.symbolCross}`} width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 10H50V30H70V50H50V70H30V50H10V30H30V10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>

      <div className={styles.valuePropGrid}>
        <div ref={valuePropContentRef} className={styles.contentWrapper}>
          <div className={styles.propHeader}>
            <span className={styles.propLabel}>
              Unmatched <span className={styles.gradientText}>Precision</span>
            </span>
            <h2 className={styles.propTitle}>
              Bringing Real-World <span className={styles.gradientText}>Anatomy</span> to the Lab.
            </h2>
          </div>
          <p className={styles.propDesc}>
            All our products are developed by globally renowned suppliers. We
            are exclusive distributors for industry-leading brands, ensuring the
            highest fidelity training tools available in India.
          </p>
          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <span className={`${styles.checkIcon} material-symbols-outlined`}>check_circle</span>
              <span className={styles.featureText}>Unbreakable Materials</span>
            </div>
            <div className={styles.featureItem}>
              <span className={`${styles.checkIcon} material-symbols-outlined`}>check_circle</span>
              <span className={styles.featureText}>
                Modular <span className={styles.gradientText}>Learning</span>
              </span>
            </div>
          </div>
        </div>

        <div className={styles.torsoImageContainer}>
          <div ref={radialGlowRef} className={styles.radialGlow}></div>

          {/* Glassmorphic Statistics Cards */}
          <div className={styles.statsContainer}>
            <div className={styles.statsCard}>
              <span className={styles.statsValue}>50+</span>
              <span className={styles.statsLabel}>Anatomy Models</span>
            </div>
            <div className={styles.statsCard}>
              <span className={styles.statsValue}>100+</span>
              <span className={styles.statsLabel}>Institutions</span>
            </div>
            <div className={styles.statsCard}>
              <span className={styles.statsValue}>15+</span>
              <span className={styles.statsLabel}>Years of Experience</span>
            </div>
          </div>

          <div ref={torsoScrollRef} className={styles.torsoScrollWrapper}>
            <div ref={torsoParallaxRef} className={styles.torsoParallaxWrapper}>
              <div ref={torsoFloatRef} className={styles.torsoFloatWrapper} style={{ position: "relative" }}>
                {/* Image zoom wrapper — overflow hidden clips zoom correctly */}
                <div className={styles.torsoImageZoom}>
                  <Image
                    src="/Human Anatomy Torso model.png"
                    alt="Human Anatomy Torso Model"
                    width={880}
                    height={1060}
                    loading="lazy"
                    className={styles.torsoImage}
                  />
                </div>

                {/* Interactive Anatomy Hotspots — outside zoom clip so tooltips show fully */}
                {hotspots.map((spot) => (
                  <div
                    key={spot.id}
                    className={styles.hotspot}
                    style={{ top: spot.top, left: spot.left }}
                  >
                    <div className={styles.hotspotDot}></div>
                    <div className={styles.hotspotPulse}></div>
                    <div className={styles.hotspotTooltip}>
                      <h4 className={styles.tooltipTitle}>{spot.title}</h4>
                      <p className={styles.tooltipDesc}>{spot.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
