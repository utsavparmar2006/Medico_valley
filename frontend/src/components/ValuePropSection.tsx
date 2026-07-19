'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import styles from '@/app/page.module.css';

gsap.registerPlugin(ScrollTrigger);

interface CollegeSector {
  id: string;
  title: string; // Supports line breaks
  desc: string;
  defaultImg: string;
  hoverImg: string;
}

export default function ValuePropSection() {
  const router = useRouter();
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const sectors: CollegeSector[] = [
    {
      id: 'medical',
      title: 'Anatomy\nLab',
      desc: 'Advanced human anatomy models, clinical skill task trainers, and high-fidelity patient simulators tailored for MBBS and MD labs.',
      defaultImg: '/labs/anatomy_default.png',
      hoverImg: '/labs/anatomy_hover.png',
    },
    {
      id: 'homeopathy',
      title: 'Homeopathy\nLab',
      desc: 'Specialized embryology models, pathology charts, and organ-specific physiology units designed for BHMS student labs.',
      defaultImg: '/labs/homeopathy_default.png',
      hoverImg: '/labs/homeopathy_hover.png',
    },
    {
      id: 'nursing',
      title: 'Nursing\nSkills Lab',
      desc: 'Comprehensive patient care mannequins, injection simulators, and practical competency kits for nursing curriculum skills.',
      defaultImg: '/labs/nursing_default.png',
      hoverImg: '/labs/nursing_hover.png',
    },
    {
      id: 'ayurvedic',
      title: 'Ayurvedic\nLab',
      desc: 'Traditional anatomical representations, core model structures, and specialized teaching frameworks.',
      defaultImg: '/labs/ayurvedic_default.png',
      hoverImg: '/labs/ayurvedic_hover.png',
    },
  ];

  useGSAP(
    () => {
      // Check if user prefers reduced motion
      const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isReduced) return;

      // Animate Section Header
      gsap.fromTo(
        `.${styles.collegesHeader}`,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: `.${styles.collegesHeader}`,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Animate the 4 cards in a staggered fade-up layout when entering viewport
      gsap.fromTo(
        `.${styles.collegeCard}`,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.15, // Smooth staggered transition between cards
          ease: 'power3.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    },
    { scope: sectionRef }
  );

  const handleCardClick = () => {
    // Navigate to products catalog page
    router.push('/products');
  };

  return (
    <section ref={sectionRef} className={styles.collegesSection}>
      <div className={styles.collegesContainer}>
        {/* Section Header */}
        <div className={styles.collegesHeader}>
          <span className={styles.collegesLabel}>Our Sectors</span>
          <h2 className={styles.collegesTitle}>
            Equipping Medical &amp; Allied Institutions
          </h2>
          <p className={styles.collegesDesc}>
            We provide a comprehensive range of international-standard anatomical models, simulators, 
            and task trainers designed specifically for medical colleges, homeopathy institutes, nursing, and ayurvedic academies.
          </p>
        </div>

        {/* Colleges Grid — 4 items rendered side by side with entrance animation */}
        <div ref={gridRef} className={styles.collegesGrid}>
          {sectors.map((sector) => (
            <div
              key={sector.id}
              className={styles.collegeCard}
              onClick={handleCardClick}
            >
              {/* Card Background Image (Default / Hover states swap) */}
              <div className={styles.cardImageContainer}>
                <Image
                  src={sector.defaultImg}
                  alt={sector.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className={styles.cardSectorImage}
                  priority
                />
                <Image
                  src={sector.hoverImg}
                  alt={`${sector.title} Hover`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className={`${styles.cardSectorImage} ${styles.cardSectorImageHover}`}
                />
              </div>

              {/* Card Overlay Content */}
              <div className={styles.cardOverlay}>
                {/* Top Content: Large Bold Title & Teal Explore Now Button */}
                <div className={styles.cardTopContent}>
                  <h3 className={styles.cardTitleLarge}>{sector.title}</h3>
                  <button className={styles.exploreNowBtn} type="button">
                    Explore Now
                  </button>
                </div>

                {/* Bottom Content: Short Description appears on hover */}
                <p className={styles.cardDescFade}>{sector.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
