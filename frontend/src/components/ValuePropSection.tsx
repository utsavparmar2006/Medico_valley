'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getBackendUrl } from '@/utils/api';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import styles from '@/app/page.module.css';

gsap.registerPlugin(ScrollTrigger);

interface CollegeSector {
  _id?: string;
  id?: string;
  title: string;
  desc: string;
  defaultImg: string;
  hoverImg?: string;
  linkUrl?: string;
}

const FALLBACK_SECTORS: CollegeSector[] = [
  {
    id: 'medical-colleges',
    title: 'Medical Colleges & Universities',
    desc: 'Foundational anatomy models, clinical skill task trainers, and high-fidelity patient simulators tailored for MBBS and postgraduate training.',
    defaultImg: '/labs/anatomy_default.png',
    hoverImg: '/labs/anatomy_hover.png',
    linkUrl: '/simulation-centre',
  },
  {
    id: 'nursing-colleges',
    title: 'Nursing Colleges & Schools',
    desc: 'Comprehensive patient care mannequins, maternal/child simulators, and practical competency kits for nursing skills labs.',
    defaultImg: '/labs/nursing_default.png',
    hoverImg: '/labs/nursing_hover.png',
    linkUrl: '/simulation-centre',
  },
  {
    id: 'hospitals-clinical',
    title: 'Hospitals & Clinical Training Centres',
    desc: 'High-fidelity simulation equipment, debriefing systems, and acute care scenarios for resident training and team assessment.',
    defaultImg: '/labs/anatomy_default.png',
    hoverImg: '/labs/anatomy_hover.png',
    linkUrl: '/simulation-centre',
  },
  {
    id: 'dental-allied',
    title: 'Dental, Physiotherapy & Allied Health',
    desc: 'Specialized phantom heads, physical therapy trainers, and procedural skill kits for allied healthcare education.',
    defaultImg: '/labs/homeopathy_default.png',
    hoverImg: '/labs/homeopathy_hover.png',
    linkUrl: '/simulation-centre',
  },
  {
    id: 'ayurveda-homeopathy',
    title: 'Ayurveda & Homeopathy Colleges',
    desc: 'Anatomical representations, embryology models, and physiological teaching aids designed for BAMS and BHMS curricula.',
    defaultImg: '/labs/ayurvedic_default.png',
    hoverImg: '/labs/ayurvedic_hover.png',
    linkUrl: '/simulation-centre',
  },
  {
    id: 'independent-centres',
    title: 'Independent Simulation Centres',
    desc: 'Turnkey room planning, AV debriefing systems, and multi-specialty simulator suites for professional clinical training.',
    defaultImg: '/labs/nursing_default.png',
    hoverImg: '/labs/nursing_hover.png',
    linkUrl: '/simulation-centre',
  },
];

interface SectorCardItemProps {
  sector: CollegeSector;
  index: number;
}

function SectorCardItem({ sector, index }: SectorCardItemProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isHovered) return;
    const handleClickOutside = (e: TouchEvent | MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setIsHovered(false);
      }
    };
    document.addEventListener('touchstart', handleClickOutside);
    return () => document.removeEventListener('touchstart', handleClickOutside);
  }, [isHovered]);

  const handleCardClick = (e: React.MouseEvent) => {
    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    if (isTouch && !isHovered) {
      e.preventDefault();
      setIsHovered(true);
      return;
    }
    router.push(sector.linkUrl || '/simulation-centre');
  };

  const hoverImageSrc = sector.hoverImg && sector.hoverImg.trim() !== '' ? sector.hoverImg : sector.defaultImg;

  return (
    <div
      ref={cardRef}
      key={sector._id || sector.id || index}
      className={`${styles.collegeCard} ${isHovered ? styles.touchActive : ''}`}
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
          priority={index === 0}
        />
        <Image
          src={hoverImageSrc}
          alt={`${sector.title} Hover`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className={`${styles.cardSectorImage} ${styles.cardSectorImageHover}`}
        />
      </div>

      {/* Card Overlay Content */}
      <div className={styles.cardOverlay}>
        {/* Top Content: Large Bold Title & Teal Build Your Lab Button */}
        <div className={styles.cardTopContent}>
          <h3 className={styles.cardTitleLarge} style={{ whiteSpace: 'pre-line' }}>{sector.title}</h3>
          <button
            type="button"
            className={styles.exploreNowBtn}
            onClick={(e) => {
              e.stopPropagation();
              const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
              if (isTouch && !isHovered) {
                setIsHovered(true);
                return;
              }
              router.push('/simulation-centre');
            }}
          >
            Build Your Lab
          </button>
        </div>

        {/* Bottom Content: Short Description appears on hover */}
        <p className={styles.cardDescFade}>{sector.desc}</p>
      </div>
    </div>
  );
}

export default function ValuePropSection() {
  const router = useRouter();
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [sectors, setSectors] = useState<CollegeSector[]>(FALLBACK_SECTORS);

  useEffect(() => {
    async function loadSectors() {
      try {
        const targetUrl = getBackendUrl('http://localhost:5000/api/public/sectors');
        const res = await fetch(`${targetUrl}?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        }).catch(() => null);

        if (res && res.ok) {
          const data = await res.json().catch(() => null);
          if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
            setSectors(data.data);
          }
        }
      } catch (err) {
        // Fallback to default static sectors if backend fetch fails
      }
    }
    loadSectors();
  }, []);

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

  return (
    <section ref={sectionRef} className={styles.collegesSection}>
      <div className={styles.collegesContainer}>
        {/* Section Header */}
        <div className={styles.collegesHeader}>
          <span className={styles.collegesLabel}>INSTITUTIONS SERVED</span>
          <h2 className={styles.collegesTitle}>
            Solutions for Every Healthcare Education Environment
          </h2>
          <p className={styles.collegesDesc}>
            We tailor technology, room planning and implementation to the learning goals of each institution - from foundational skills practice to high-fidelity team training and assessment.
          </p>
        </div>

        {/* Colleges Grid — 4 items rendered side by side with entrance animation */}
        <div ref={gridRef} className={styles.collegesGrid}>
          {sectors.map((sector, index) => (
            <SectorCardItem key={sector._id || sector.id || index} sector={sector} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
