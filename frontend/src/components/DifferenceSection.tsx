'use client';

import { useRef, useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { getBackendUrl } from '@/utils/api';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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

// Helper: final resting rotations for each card index
const CARD_ROTATIONS = [-5, 4, -3, 3, -1];

export default function DifferenceSection() {
  const differenceSectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const differenceBgTitleRef = useRef<HTMLHeadingElement>(null);
  const [cards, setCards] = useState<DeltaDifferenceCard[]>(FALLBACK_CAPABILITIES);
  const [isMobile, setIsMobile] = useState(false);
  // Track whether the API fetch has completed so GSAP only runs once with final data
  const [dataReady, setDataReady] = useState(false);

  // Initialize Embla Carousel for mobile swiping
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // Detect mobile viewport size on client mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
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

  // Fetch initial data on mount — set dataReady once complete (success or failure)
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const apiBase = getBackendUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');
        const res = await fetch(`${apiBase}/public/delta-difference`);
        if (res.ok) {
          const result = await res.json();
          if (result.success && Array.isArray(result.data)) {
            // Sort explicitly by displayOrder ASC to guarantee card rendering order consistency
            const sorted = [...result.data].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            if (sorted.length === 5) {
              setCards(sorted);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch delta difference cards:', err);
      } finally {
        // Signal that the fetch phase is done regardless of outcome.
        // GSAP will only initialize after this flag is set.
        setDataReady(true);
      }
    };

    fetchCards();
  }, []);

  useEffect(() => {
    // ── Guard 1: Mobile uses Embla carousel — desktop refs are not mounted ──
    if (isMobile) return;

    // ── Guard 2: Wait for API fetch to complete before setting up GSAP ──
    if (!dataReady) return;

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cardsElements = cardRefs.current.filter(Boolean) as HTMLElement[];
    const bgTitle = differenceBgTitleRef.current;

    // ── Reduced-motion or invalid dimensions fallback: make everything immediately visible ──
    if (isReduced || window.innerWidth < 1024 || cardsElements.length !== 5 || !differenceSectionRef.current || !bgTitle) {
      if (cardsElements.length > 0) {
        gsap.set(cardsElements, { opacity: 1, x: 0, y: 0, rotation: (idx) => CARD_ROTATIONS[idx] || 0, scale: 1, clearProps: 'all' });
      }
      if (bgTitle) {
        gsap.set(bgTitle, { opacity: 1, scale: 1, clearProps: 'all' });
      }
      return;
    }

    // ── Create a single GSAP context for proper scoping and cleanup ──
    const ctx = gsap.context(() => {
      // Create one GSAP timeline with scroll scrubbing
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: differenceSectionRef.current,
          start: 'top 85%',
          end: 'center 45%',
          scrub: 1.0, // Links the animation progress directly to scrollbar with smooth lag
          invalidateOnRefresh: true,
          refreshPriority: -1,
        }
      });

      // Animate the background watermark title
      tl.fromTo(
        bgTitle,
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, ease: 'power2.out', duration: 0.35 },
        0
      );

      cardsElements.forEach((card, idx) => {
        const rotation = CARD_ROTATIONS[idx];
        const xVal = idx === 0 || idx === 2 ? -180 : idx === 1 || idx === 3 ? 180 : 0;
        const yVal = idx === 4 ? 120 : 90;
        const rotateStart = idx === 0 || idx === 2 ? 10 : idx === 1 || idx === 3 ? -10 : 5;

        tl.fromTo(
          card,
          { x: xVal, y: yVal, rotation: rotateStart, opacity: 0, scale: 0.9 },
          { x: 0, y: 0, rotation: rotation, opacity: 1, scale: 1, ease: 'power3.out', duration: 0.4 },
          idx * 0.05 + 0.05 // staggered start times so all 5 cards complete fully when entering section
        );
      });

      // Force GSAP to sort all triggers by their position in the DOM and recalculate their bounds
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, differenceSectionRef);

    // Cleanup only with ctx.revert()
    return () => {
      ctx.revert();
    };
  }, [isMobile, dataReady]);

  // Early return for Mobile Carousel view
  if (isMobile) {
    return (
      <section ref={differenceSectionRef} className={styles.mobileDifferenceSection}>
        <div className={styles.mobileHeader}>
          <span className={styles.mobileSectionLabel}>WHY CHOOSE US</span>
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
                <div className={`${styles.mobileTestimonialCard} ${styles[`cardBg${idx + 1}`]}`}>
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
      {/* Background logo watermark centered, scaling and fading on scroll */}
      <div className={styles.stickyHeader}>
        <div ref={differenceBgTitleRef} className={styles.differenceBgLogo}>
          <img src="/logo-icon-only.png" alt="Medico Valley Logo Watermark" />
        </div>
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
