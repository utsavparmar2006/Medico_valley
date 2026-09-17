"use client";

import { useRef, useEffect, useLayoutEffect, useState } from "react";
import { getBackendUrl } from "@/utils/api";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./page.module.css";
import Lenis from "lenis";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

import ProcessFlowSection from "@/components/ProcessFlowSection";
import SolutionsSection from "@/components/SolutionsSection";
import FeaturedSpotlightSection from "@/components/FeaturedSpotlightSection";
import ConsultationBannerSection from "@/components/ConsultationBannerSection";
import ValuePropSection from "@/components/ValuePropSection";
import InstitutionTrustSection from "@/components/InstitutionTrustSection";
import PremiumFooter from "@/components/PremiumFooter";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  displayOrder?: number;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  mediaUrls: string[];
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'anatomy-models': 'Learning anatomy is the first crucial step towards understanding medicine. This portal offers the highest range of Anatomy Models in India - helping students, professors, and patients in visualizing 3D anatomy!',
  'medical-simulators': 'Our highest range of Medical Simulators in India, offers a risk free environment, brings further advancement to clinical skills, and promotes quantifiable training.',
  'task-trainers': '"Practice makes perfect" is a common idiom which can be verified using our highest range of task trainers in India. Task trainers are used for practicing specific procedures on a repeat mode, improving hand-eye coordination.'
};

const HERO_VIDEO_SRC = "/hero_video.mp4";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Redesigned Catalog States & Refs
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const catalogSectionRef = useRef<HTMLDivElement>(null);

  // Scoped Refs
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const catalogHeaderRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    ScrollTrigger.clearScrollMemory("manual");
    window.scrollTo(0, 0);

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true));
      ScrollTrigger.clearScrollMemory("manual");
      document.documentElement.classList.remove("lenis", "lenis-smooth", "lenis-stopped", "lenis-scrolling");
      document.body.classList.remove("lenis", "lenis-smooth", "lenis-stopped", "lenis-scrolling");
    };
  }, []);

  // Initialize Lenis smooth scrolling globally
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    // Update ScrollTrigger on scroll
    lenis.on("scroll", ScrollTrigger.update);
    lenis.scrollTo(0, { immediate: true });

    // Sync GSAP ticker with Lenis
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
    };
  }, []);

  // Refresh ScrollTrigger layout once products and categories load to avoid blank gaps
  useEffect(() => {
    if (!categoriesLoading && !productsLoading) {
      const refresh = () => {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      };
      const firstTimer = setTimeout(refresh, 100);
      const secondTimer = setTimeout(refresh, 700);
      window.addEventListener("load", refresh);

      return () => {
        clearTimeout(firstTimer);
        clearTimeout(secondTimer);
        window.removeEventListener("load", refresh);
      };
    }
  }, [categoriesLoading, productsLoading]);

  // Fetch active products on mount
  useEffect(() => {
    async function fetchProducts() {
      try {
        const targetUrl = getBackendUrl("http://localhost:5001/api/public/products");
        const res = await fetch(`${targetUrl}?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        }).catch(() => null);
        if (res && res.ok) {
          const data = await res.json().catch(() => null);
          if (data && data.success) {
            setProducts(data.data);
          }
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setProductsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Organic subtle float loops for floating category images
  useGSAP(
    () => {
      if (categoriesLoading || productsLoading || !catalogSectionRef.current) return;
      const innerImages = catalogSectionRef.current.querySelectorAll(".floating-inner-img");
      innerImages.forEach((img: any, i) => {
        gsap.to(img, {
          y: i % 2 === 0 ? -6 : 6,
          x: i % 3 === 0 ? -3 : 3,
          rotation: i % 2 === 0 ? -1 : 1,
          duration: 3.5 + (i * 0.4),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    },
    { scope: catalogSectionRef, dependencies: [categoriesLoading, productsLoading, products] }
  );

  // Hover transitions controlled by GSAP Context
  useGSAP(
    () => {
      if (!catalogSectionRef.current) return;

      const columns = catalogSectionRef.current.querySelectorAll(`.${styles.catalogColumn}`);
      columns.forEach((col) => {
        const slug = col.getAttribute("data-slug");
        const isHovered = hoveredCategory === slug;
        const hasAnyHovered = hoveredCategory !== null;

        // 1. Fade other columns
        let opacity = 1;
        if (hasAnyHovered && !isHovered) {
          opacity = 0.4;
        }
        gsap.to(col, { opacity, duration: 0.4, ease: "power2.out", overwrite: "auto" });

        // 2. Arrow slide
        const arrow = col.querySelector(`.${styles.exploreArrow}`);
        if (arrow) {
          gsap.to(arrow, {
            x: isHovered ? 8 : 0,
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto"
          });
        }
      });
    },
    { dependencies: [hoveredCategory], scope: catalogSectionRef }
  );

  const handleCatalogMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Left empty to prevent images from drifting on mouse move
  };

  const handleCatalogMouseLeave = () => {
    setHoveredCategory(null);
  };

  useEffect(() => {
    async function fetchCategories() {
      try {
        const targetUrl = getBackendUrl("http://localhost:5001/api/public/categories");
        const res = await fetch(`${targetUrl}?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        }).catch(() => null);
        if (res && res.ok) {
          const data = await res.json().catch(() => null);
          if (data && data.success) {
            const sorted = [...data.data].sort((a: Category, b: Category) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
            setCategories(sorted);
          }
        }
      } catch (err) {
        // Silently catch fetch connection drop
      } finally {
        setCategoriesLoading(false);
      }
    }
    fetchCategories();

  }, []);

  // Recalibrate GSAP ScrollTrigger offsets as the page layout/height settles
  useEffect(() => {
    const refresh = () => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };

    // Staggered timers to catch delayed height changes (like images loading or API data rendering)
    const timers = [
      setTimeout(refresh, 200),
      setTimeout(refresh, 500),
      setTimeout(refresh, 1000),
      setTimeout(refresh, 2000),
    ];

    window.addEventListener("load", refresh);
    window.addEventListener("resize", refresh);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("load", refresh);
      window.removeEventListener("resize", refresh);
    };
  }, []);

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "anatomy-models":
        return "biotech";
      case "medical-simulators":
        return "settings_accessibility";
      case "task-trainers":
        return "vital_signs";
      default:
        return "medical_services";
    }
  };

  // Ensure hero video autoplays smoothly
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // ScrollTriggers that depend on categories loading — Fade + Scale Zoom (Apple style)
  useGSAP(
    () => {
      if (categoriesLoading) return;

      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!isReduced && catalogSectionRef.current) {
        const slides = Array.from(
          catalogSectionRef.current.querySelectorAll(`.${styles.categorySwipeSlide}`)
        ) as HTMLElement[];
        const isDesktop = window.innerWidth >= 768;

        if (isDesktop && slides.length > 1) {

          // Initial state: first slide fully visible, rest hidden
          slides.forEach((slide, idx) => {
            if (idx === 0) {
              gsap.set(slide, {
                opacity: 1,
                scale: 1,
              });
            } else {
              gsap.set(slide, {
                opacity: 0,
                scale: 0.94,
              });
            }
          });

          // Build timeline — sequential fade so previous slide fades to 0 BEFORE next slide fades in (zero overlap)
          const fadeTl = gsap.timeline({
            scrollTrigger: {
              trigger: catalogSectionRef.current,
              start: "top top",
              end: `+=${(slides.length - 1) * 110}%`,
              scrub: 0.8,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const newIdx = Math.min(
                  Math.floor(self.progress * slides.length),
                  slides.length - 1
                );
                setActiveSlideIndex(newIdx);
              },
            },
          });

          slides.forEach((slide, idx) => {
            if (idx === 0) return;
            const prevSlide = slides[idx - 1];

            // 1. Outgoing slide fades completely to 0
            fadeTl.to(
              prevSlide,
              {
                opacity: 0,
                scale: 1.04,
                duration: 0.45,
                ease: "power2.in",
              }
            );

            // 2. Incoming slide fades in from 0 to 1 AFTER outgoing slide has vanished
            fadeTl.fromTo(
              slide,
              {
                opacity: 0,
                scale: 0.96,
              },
              {
                opacity: 1,
                scale: 1,
                duration: 0.55,
                ease: "power2.out",
              }
            );
          });
        }
      }
    },
    { scope: containerRef, dependencies: [categoriesLoading] }
  );


  return (
    <div ref={containerRef} className={styles.pageWrapper}>
      <main className={styles.mainContent}>
        {/* Hero Section - Clean Video Only */}
        <section
          ref={heroSectionRef}
          className={styles.heroSection}
        >
          <div className={styles.heroVideo}>
            <video
              ref={videoRef}
              src={HERO_VIDEO_SRC}
              className={styles.heroVideoElement}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
          </div>
        </section>

        {/* Category Section — 3D Drum Wheel Carousel */}
        <section
          ref={catalogSectionRef}
          className={styles.premiumCatalogSectionSwipe}
        >
          {/* preserve-3d needed so GSAP rotateX renders in real 3D */}
          <div className={styles.categorySwipeContainer} style={{ transformStyle: 'preserve-3d' }}>
            {categoriesLoading ? (
              <div className={styles.categorySwipeSlide}>
                <div className={styles.swipeSlideLeft}>
                  <div style={{ height: '48px', width: '250px', background: 'rgba(0,0,0,0.06)', marginBottom: '24px', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                  <div style={{ height: '48px', width: '180px', background: 'rgba(0,0,0,0.04)', borderRadius: '6px', animation: 'pulse 1.5s infinite' }} />
                </div>
                <div className={styles.swipeSlideRight}>
                  <div style={{ height: '80%', width: '80%', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
                </div>
              </div>
            ) : categories.length > 0 ? (
              categories.map((cat, index) => (
                <div
                  key={cat._id}
                  className={styles.categorySwipeSlide}
                  style={{
                    transformStyle: 'preserve-3d',
                    pointerEvents: index === activeSlideIndex ? 'auto' : 'none',
                    zIndex: index === activeSlideIndex ? 20 : 1,
                  }}
                >
                  <div className={styles.swipeSlideLeft}>
                    <h2 className={styles.swipeSlideTitle}>{cat.name}</h2>
                    <p className={styles.swipeSlideDescription}>
                      {CATEGORY_DESCRIPTIONS[cat.slug] || cat.description}
                    </p>
                    <Link
                      href={`/products/${cat.slug}`}
                      scroll={true}
                      className={styles.swipeSlideBtn}
                      style={{ pointerEvents: 'auto', position: 'relative', zIndex: 50 }}
                    >
                      Explore Now
                    </Link>
                  </div>
                  <div className={styles.swipeSlideRight}>
                    {cat.imageUrl ? (
                      <div className={styles.swipeImageWrap}>
                        <Image
                          src={cat.imageUrl}
                          alt={cat.name}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className={styles.swipeImage}
                          priority={index === 0}
                        />
                      </div>
                    ) : (
                      <div className={styles.swipeImagePlaceholder}>
                        <span className="material-symbols-outlined" style={{ fontSize: '120px', color: 'rgba(10, 141, 147, 0.15)' }}>
                          {getCategoryIcon(cat.slug)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", width: "100%", color: "var(--secondary-text)", padding: "100px 0" }}>
                No categories available at the moment.
              </div>
            )}
          </div>

          {/* Drum Wheel Progress Indicator Removed */}
        </section>

        {/* New Section 1: "From Vision to a Fully Operational Simulation Centre" */}
        <ProcessFlowSection />

        {/* SOLUTIONS Section & 5 Cards with Premium Difference UI */}
        <SolutionsSection />

        {/* Featured Product Spotlight — admin-controlled, shows between Tailored Solutions & Clients */}
        <FeaturedSpotlightSection />

        {/* Trust Banner & Logos */}
        <InstitutionTrustSection />

        {/* INSTITUTIONS SERVED — 6 Target Sectors */}
        <ValuePropSection />

        {/* New Section 2: "Planning a Simulation Centre or Skills Lab?" Consultation Banner */}
        <ConsultationBannerSection />
      </main>

      <PremiumFooter />
    </div>
  );
}
