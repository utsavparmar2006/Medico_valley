'use client';

import { useRef, useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import styles from '@/app/page.module.css';

gsap.registerPlugin(ScrollTrigger);

interface DeltaDifferenceCard {
  _id?: string;
  title: string;
  category: string;
  description: string;
  initials: string;
  displayOrder?: number;
}

const FALLBACK_CAPABILITIES: DeltaDifferenceCard[] = [
  {
    title: "Anatomical Models",
    category: "Anatomy",
    description: "Dissectible organs, sagittal divisions, and highly-detailed vascular structures for deep scientific learning.",
    initials: "AM"
  },
  {
    title: "Clinical Skills",
    category: "Task Trainers",
    description: "Realistic feedback modules for vascular access, airway management, and suturing techniques.",
    initials: "CS"
  },
  {
    title: "High-Fidelity Manikins",
    category: "Simulators",
    description: "Full-body simulation systems with integrated physiology, life-like responses, and clinical monitoring.",
    initials: "HF"
  },
  {
    title: "Immersive Training",
    category: "Innovation",
    description: "State-of-the-art virtual clinical environments (VR) for training multiple student teams simultaneously.",
    initials: "VR"
  },
  {
    title: "Exclusive Partnerships",
    category: "Global Reach",
    description: "Bringing the world's most trusted, international-standard medical simulation technologies directly to Indian labs.",
    initials: "EP"
  }
];

export default function DifferenceSection() {
  const differenceSectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const differenceBgTitleRef = useRef<HTMLHeadingElement>(null);
  const [cards, setCards] = useState<DeltaDifferenceCard[]>(FALLBACK_CAPABILITIES);
  const [isMobile, setIsMobile] = useState(false);

  // Initialize Embla Carousel for mobile swiping
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // Detect mobile viewport size on client mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sync scroll snaps and active slide index
  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', () => {
      setScrollSnaps(emblaApi.scrollSnapList());
      setSelectedIndex(emblaApi.selectedScrollSnap());
    });
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  // Autoplay functionality: auto changes every 4.5 seconds, pauses on interaction
  useEffect(() => {
    if (!emblaApi || !isMobile) return;

    let intervalId: NodeJS.Timeout;
    let isInteracting = false;

    const startAutoplay = () => {
      intervalId = setInterval(() => {
        if (!isInteracting && emblaApi.canScrollNext()) {
          emblaApi.scrollNext();
        }
      }, 4500);
    };

    const stopAutoplay = () => {
      clearInterval(intervalId);
    };

    const onPointerDown = () => {
      isInteracting = true;
      stopAutoplay();
    };

    const onPointerUp = () => {
      isInteracting = false;
      startAutoplay();
    };

    emblaApi.on('pointerDown', onPointerDown);
    emblaApi.on('pointerUp', onPointerUp);
    emblaApi.on('settle', () => {
      isInteracting = false;
    });

    startAutoplay();

    return () => {
      stopAutoplay();
      if (emblaApi) {
        emblaApi.off('pointerDown', onPointerDown);
        emblaApi.off('pointerUp', onPointerUp);
      }
    };
  }, [emblaApi, isMobile]);

  useEffect(() => {
    async function fetchCards() {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiBase}/public/delta-difference`);
        if (!res.ok) return;
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          // Sort explicitly by displayOrder ASC to guarantee card rendering order consistency
          const sorted = [...result.data].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          if (sorted.length === 5) {
            setCards(sorted);
          }
        }
      } catch (err) {
        console.error('Failed to fetch delta difference cards:', err);
      }
    }
    fetchCards();
  }, []);

  useGSAP(
    () => {
      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!isReduced) {
        const isDesktop = window.innerWidth >= 1024;

        if (isDesktop && differenceSectionRef.current && differenceBgTitleRef.current) {
          const diffTl = gsap.timeline({
            scrollTrigger: {
              trigger: differenceSectionRef.current,
              start: "top top",
              end: "+=2000px",
              scrub: 1,
              pin: true,
              invalidateOnRefresh: true,
            }
          });

          // Animate background title scaling
          diffTl.fromTo(
            differenceBgTitleRef.current,
            { scale: 0.9, opacity: 1 },
            { scale: 1.05, opacity: 1, ease: "power1.inOut" },
            0
          );

          // Staggered paths for the capability cards
          cardRefs.current.forEach((card, idx) => {
            if (!card) return;
            const rotation = idx === 0 ? -5 : idx === 1 ? 4 : idx === 2 ? -3 : idx === 3 ? 3 : -1;
            const xVal = idx === 0 || idx === 2 ? -300 : idx === 1 || idx === 3 ? 300 : 0;
            const yVal = idx === 4 ? 500 : idx === 2 || idx === 3 ? 400 : 300;
            const rotateStart = idx === 0 || idx === 2 ? 15 : idx === 1 || idx === 3 ? -15 : 8;

            diffTl.fromTo(
              card,
              { x: xVal, y: yVal, rotation: rotateStart, opacity: 0, scale: 0.85 },
              { x: 0, y: 0, rotation: rotation, opacity: 1, scale: 1, ease: "power2.out" },
              idx * 0.12
            );
          });

          // Smooth fade-out of cards and title at the end of scroll
          diffTl.to(
            [...cardRefs.current.filter(Boolean), differenceBgTitleRef.current],
            {
              opacity: 0,
              y: -60,
              stagger: 0.05,
              ease: "power1.in",
            },
            0.82
          );
        }
      } else {
        // Fallback for reduced motion
        gsap.set(cardRefs.current.filter(Boolean), { opacity: 1, x: 0, y: 0, rotation: 0 });
      }
    },
    { scope: differenceSectionRef } // timeline created ONLY ONCE on mount, dependencies excluded to prevent animation destruction
  );

  // Early return for Mobile Carousel view
  if (isMobile) {
    return (
      <section ref={differenceSectionRef} className={styles.mobileDifferenceSection}>
        <div className={styles.mobileHeader}>
          <span className={styles.mobileSectionLabel}>THE DELTA DIFFERENCE</span>
          <h2 className={styles.mobileDifferenceTitle}>
            The Medico Valley Difference
          </h2>
          <div className={styles.carouselDots}>
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                className={`${styles.carouselDot} ${index === selectedIndex ? styles.carouselDotActive : ''}`}
                onClick={() => emblaApi && emblaApi.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className={styles.emblaViewport} ref={emblaRef}>
          <div className={styles.emblaContainer}>
            {cards.map((c, idx) => (
              <div key={idx} className={styles.emblaSlide}>
                <div className={`${styles.testimonialCard} ${styles[`cardBg${idx + 1}`]} ${styles.mobileTestimonialCard}`}>
                  <p className={styles.testimonialQuote}>"{c.description}"</p>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.authorAvatar}>
                      <span>{c.initials}</span>
                    </div>
                    <div className={styles.authorInfo}>
                      <h4 className={styles.authorName}>{c.title}</h4>
                      <p className={styles.authorTitle}>{c.category}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.swipeIndicator}>
          ← Swipe →
        </div>
      </section>
    );
  }

  return (
    <section ref={differenceSectionRef} className={styles.differenceSection}>
      <div className={styles.stickyHeader}>
        <h2 ref={differenceBgTitleRef} className={styles.differenceBgTitle}>
          The Medico Valley Difference
        </h2>
      </div>

      <div className={styles.cardsContainer}>
        {cards.map((c, idx) => (
          <div
            key={idx} // Using array index key ensures stable DOM elements across state updates to prevent remounting and maintain GSAP binding integrity
            ref={(el) => {
              if (el) cardRefs.current[idx] = el;
            }}
            className={`${styles.testimonialCard} ${styles[`cardBg${idx + 1}`]}`}
          >
            <p className={styles.testimonialQuote}>"{c.description}"</p>
            <div className={styles.testimonialAuthor}>
              <div className={styles.authorAvatar}>
                <span>{c.initials}</span>
              </div>
              <div className={styles.authorInfo}>
                <h4 className={styles.authorName}>{c.title}</h4>
                <p className={styles.authorTitle}>{c.category}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


