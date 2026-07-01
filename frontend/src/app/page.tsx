"use client";

import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getBackendUrl } from "@/utils/api";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./page.module.css";
import Lenis from "lenis";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Lazy-load heavy sections using dynamic imports to optimize homepage bundle size and initial load time
const DifferenceSection = dynamic(() => import("@/components/DifferenceSection"), { ssr: false });
const ValuePropSection = dynamic(() => import("@/components/ValuePropSection"), { ssr: false });
const InstitutionTrustSection = dynamic(() => import("@/components/InstitutionTrustSection"), { ssr: false });
const PremiumFooter = dynamic(() => import("@/components/PremiumFooter"), { ssr: false });

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
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

const VIDEO_1_SRC = "/GigXR-Homepage.m4v";
const VIDEO_2_SRC = "/sec_video.mp4";
const POSTER_SRC = "https://lh3.googleusercontent.com/aida-public/AB6AXuBs1TJS_og_wI-Vgf8amUYZ8jMOJXbvvzhkgtYWdpXQ41nUoq34vTzrXjerJGX04Wx_PPJI2jJurr9BajPereCDYAzIYKr0QBmXHQexjwrDJBZrMBbZMd9c4UHX1gtem_oMMPzbsUzRhbjrMBnjTePZubZOJAGHB9FO5WPFiLHdNyEC0mizXsFRj0GWZhQrOJ936uRrT2rGwO0Cs3WVFmWSPXCmN2_cFfVLe1l_XpJVaprHkIrPpqxwnTFLPV9a9QOWacr_gK8RK-jY";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Custom hero media refs for the continuous loop
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const mediaWrapperRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Redesigned Catalog States & Refs
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const catalogSectionRef = useRef<HTMLDivElement>(null);

  // Scoped Refs for elements animated with GSAP
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const heroGlassPanelRef = useRef<HTMLDivElement>(null);
  const heroTaglineRef = useRef<HTMLSpanElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const heroCtaWrapperRef = useRef<HTMLDivElement>(null);
  const catalogHeaderRef = useRef<HTMLDivElement>(null);

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

    // Sync GSAP ticker with Lenis
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(updateTicker);
    };
  }, []);

  // Refresh ScrollTrigger layout once products and categories load to avoid blank gaps
  useEffect(() => {
    if (!categoriesLoading && !productsLoading) {
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [categoriesLoading, productsLoading]);

  // Fetch active products on mount
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(getBackendUrl("http://localhost:5000/api/public/products"));
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
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
        const res = await fetch(getBackendUrl("http://localhost:5000/api/public/categories"));
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setCategories(data.data);
          }
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    }
    fetchCategories();

    const handleFocus = () => {
      fetchCategories();
    };
    window.addEventListener('focus', handleFocus);

    const interval = setInterval(() => {
      fetchCategories();
    }, 15000); // Check for updates every 15 seconds

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
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

  // Parallax spring configuration
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 100, damping: 22, mass: 0.5 };

  // Glass card movement and rotation (5-10px parallax)
  const cardTranslateX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig);
  const cardTranslateY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-12, 12]), springConfig);
  const cardRotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const cardRotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);

  // Background floating elements parallax (opposite directions for 3D depth)
  const layer1X = useSpring(useTransform(mouseX, [-0.5, 0.5], [35, -35]), springConfig);
  const layer1Y = useSpring(useTransform(mouseY, [-0.5, 0.5], [35, -35]), springConfig);

  const layer2X = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), springConfig);
  const layer2Y = useSpring(useTransform(mouseY, [-0.5, 0.5], [-20, 20]), springConfig);

  // Magnetic button motion variables
  const btnRef = useRef<HTMLButtonElement>(null);
  const btnX = useMotionValue(0);
  const btnY = useMotionValue(0);
  const springBtnX = useSpring(btnX, { stiffness: 180, damping: 15 });
  const springBtnY = useSpring(btnY, { stiffness: 180, damping: 15 });

  const handleBtnMouseMove = (e: React.MouseEvent) => {
    if (btnRef.current) {
      const { left, top, width, height } = btnRef.current.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      btnX.set(distX * 0.35);
      btnY.set(distY * 0.35);
    }
  };

  const handleBtnMouseLeave = () => {
    btnX.set(0);
    btnY.set(0);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const xVal = (clientX - left) / width - 0.5;
    const yVal = (clientY - top) / height - 0.5;
    mouseX.set(xVal);
    mouseY.set(yVal);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Custom High-Performance Hero Media Sequence (Video 1 -> Poster -> Video 2 -> Poster -> Video 1 Loop)
  useEffect(() => {
    const v1 = video1Ref.current;
    const v2 = video2Ref.current;
    const poster = posterRef.current;

    if (!v1 || !v2 || !poster) return;

    let posterTimeout: NodeJS.Timeout;
    let fadeTimeout: NodeJS.Timeout;

    // Reset styles to ensure initial consistency
    v1.style.opacity = "0";
    v2.style.opacity = "0";
    poster.style.opacity = "0";

    const onVideo1Ended = () => {
      // Transition 1: Fade out Video 1, Fade in Poster
      poster.style.opacity = "1";
      v1.style.opacity = "0";

      // Pause and reset Video 1 after the fade duration
      fadeTimeout = setTimeout(() => {
        v1.pause();
        v1.currentTime = 0;
      }, 700);

      // Preload Video 2 in the background
      v2.preload = "auto";
      v2.load();

      // Hold Poster for exactly 2 seconds, then transition to Video 2
      posterTimeout = setTimeout(() => {
        v2.currentTime = 0;
        v2.play()
          .then(() => {
            v2.style.opacity = "1";
            poster.style.opacity = "0";
          })
          .catch((err) => {
            console.log("Video 2 autoplay blocked:", err);
            v2.style.opacity = "1";
            poster.style.opacity = "0";
          });
      }, 2000);
    };

    const onVideo2Ended = () => {
      // Transition 2: Fade out Video 2, Fade in Poster
      poster.style.opacity = "1";
      v2.style.opacity = "0";

      // Pause and reset Video 2 after the fade duration
      fadeTimeout = setTimeout(() => {
        v2.pause();
        v2.currentTime = 0;
      }, 700);

      // Preload Video 1 in the background
      v1.preload = "auto";
      v1.load();

      // Hold Poster for exactly 2 seconds, then transition back to Video 1
      posterTimeout = setTimeout(() => {
        v1.currentTime = 0;
        v1.play()
          .then(() => {
            v1.style.opacity = "1";
            poster.style.opacity = "0";
          })
          .catch((err) => {
            console.log("Video 1 autoplay blocked:", err);
            v1.style.opacity = "1";
            poster.style.opacity = "0";
          });
      }, 2000);
    };

    // Attach event listeners
    v1.addEventListener("ended", onVideo1Ended);
    v2.addEventListener("ended", onVideo2Ended);

    // Initial play of Video 1 on mount
    v1.currentTime = 0;
    v1.play()
      .then(() => {
        v1.style.opacity = "1";
      })
      .catch((err) => {
        console.log("Initial Video 1 autoplay blocked:", err);
        v1.style.opacity = "1";
      });

    return () => {
      v1.removeEventListener("ended", onVideo1Ended);
      v2.removeEventListener("ended", onVideo2Ended);
      clearTimeout(posterTimeout);
      clearTimeout(fadeTimeout);
    };
  }, []);

  // GSAP Animations using safe scoped React refs
  useGSAP(
    () => {
      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const heroTl = gsap.timeline();

      if (isReduced) {
        if (heroGlassPanelRef.current) {
          heroTl.fromTo(
            heroGlassPanelRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 1.2, ease: "power2.out" }
          );
        }
      } else {
        if (heroGlassPanelRef.current) {
          heroTl.fromTo(
            heroGlassPanelRef.current,
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }
          );
        }

        if (heroTaglineRef.current) {
          heroTl.fromTo(
            heroTaglineRef.current,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
            "-=0.4"
          );
        }

        const heroWords = heroGlassPanelRef.current?.querySelectorAll(".hero-word");
        if (heroWords && heroWords.length > 0) {
          heroTl.fromTo(
            heroWords,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: "power3.out" },
            "-=0.3"
          );
        }

        if (heroSubtitleRef.current) {
          heroTl.fromTo(
            heroSubtitleRef.current,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
            "-=0.4"
          );
        }

        if (heroCtaWrapperRef.current) {
          heroTl.fromTo(
            heroCtaWrapperRef.current,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" },
            "-=0.4"
          );
        }
      }

      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      if (mediaWrapperRef.current && heroSectionRef.current && !isMobile) {
        gsap.to(mediaWrapperRef.current, {
          yPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: heroSectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    },
    { scope: containerRef }
  );

  // ScrollTriggers that depend on categories and products being loaded
  useGSAP(
    () => {
      if (categoriesLoading || productsLoading) return;

      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!isReduced) {
        // Simulation Portfolios Header Reveal
        if (catalogHeaderRef.current && catalogSectionRef.current) {
          gsap.fromTo(
            catalogHeaderRef.current,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 1.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: catalogSectionRef.current,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        // Staggered reveal for Catalog Columns (Simulation Portfolios cards)
        if (catalogSectionRef.current) {
          const targets = catalogSectionRef.current.querySelectorAll(`.${styles.catalogColumn}`);
          if (targets.length > 0) {
            gsap.fromTo(
              targets,
              { opacity: 0, y: 60, scale: 0.96 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                stagger: 0.15,
                duration: 1.2,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: catalogSectionRef.current,
                  start: "top 70%",
                  toggleActions: "play none none reverse",
                },
              }
            );
          }
        }
      } else {
        // Fallback for prefers-reduced-motion
        if (catalogHeaderRef.current) {
          gsap.set(catalogHeaderRef.current, { opacity: 1, y: 0, x: 0, scale: 1 });
        }
        if (catalogSectionRef.current) {
          const targets = catalogSectionRef.current.querySelectorAll(`.${styles.catalogColumn}`);
          if (targets.length > 0) {
            gsap.set(targets, { opacity: 1, y: 0, scale: 1 });
          }
        }
      }
    },
    { scope: containerRef, dependencies: [categoriesLoading, productsLoading] }
  );

  return (
    <div ref={containerRef} className={styles.pageWrapper}>
      <main className={styles.mainContent}>
        {/* Hero Section - Rebuilt with premium interactions */}
        <section
          ref={heroSectionRef}
          className={`${styles.heroSection} ${isHovered ? styles.heroSectionActive : ""}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
        >
          {/* Background Hero Media Container */}
          <div ref={mediaWrapperRef} className={styles.heroVideo}>
            <video
              ref={video1Ref}
              src={VIDEO_1_SRC}
              className={styles.heroMediaChild}
              muted
              playsInline
              preload="auto"
            />
            <video
              ref={video2Ref}
              src={VIDEO_2_SRC}
              className={styles.heroMediaChild}
              muted
              playsInline
              preload="auto"
            />
            <img
              ref={posterRef}
              src={POSTER_SRC}
              className={styles.heroMediaChild}
              alt="Medico Valley Hero Preview"
            />
          </div>

          {/* Content Overlay */}
          <div className={styles.heroOverlay} />

          {/* Floating Medical Icons with parallax depth layers */}
          <motion.div
            style={{ x: layer1X, y: layer1Y, top: "15%", right: "20%" }}
            className={styles.floatingIcon}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </motion.div>

          <motion.div
            style={{ x: layer2X, y: layer2Y, bottom: "25%", left: "10%" }}
            className={styles.floatingIcon}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5v14" />
            </svg>
          </motion.div>

          <motion.div
            style={{ x: layer1X, y: layer1Y, bottom: "15%", right: "15%" }}
            className={styles.floatingIcon}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
              <path d="m8.5 11.5 7 7" />
            </svg>
          </motion.div>

          <motion.div
            style={{ x: layer2X, y: layer2Y, top: "20%", left: "45%" }}
            className={styles.floatingIcon}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
              <path d="M12 8v8M9 12h6" />
            </svg>
          </motion.div>

          {/* Spring-Loaded Parallax Glass Card */}
          <motion.div
            ref={heroGlassPanelRef}
            style={{
              x: cardTranslateX,
              y: cardTranslateY,
              rotateX: cardRotateX,
              rotateY: cardRotateY,
              transformStyle: "preserve-3d",
            }}
            className={styles.heroGlassPanel}
          >
            {/* Ambient light sweep effect */}
            <div className={styles.glassCardLightSweep} />


            {/* Word-by-word headline layout */}
            <h1 className={styles.heroTitle} style={{ transform: "translateZ(50px)" }}>
              {"MEDICAL EDUCATION SOLUTIONS".split(" ").map((word, i) => (
                <span
                  key={`hero-title-${i}`}
                  className="hero-word"
                  style={{ display: "inline-block", marginRight: "0.25em" }}
                >
                  {word}
                </span>
              ))}
            </h1>

            <p ref={heroSubtitleRef} className={styles.heroSubtitle} style={{ transform: "translateZ(40px)" }}>
              Premium anatomy models, medical simulators, task trainers, VR learning systems, and laboratory solutions designed for modern medical education.
            </p>

            {/* Magnetic Button + secondary CTA */}
            <div ref={heroCtaWrapperRef} className={styles.heroCtaWrapper} style={{ transform: "translateZ(45px)" }}>
              <motion.button
                ref={btnRef}
                onMouseMove={handleBtnMouseMove}
                onMouseLeave={handleBtnMouseLeave}
                style={{ x: springBtnX, y: springBtnY }}
                className={styles.ctaButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => catalogSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                <span>Request Quote</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.button>
              <Link href="/products" className={styles.secondaryCtaButton}>
                Explore Products
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Redesigned Product Categories Section */}
        <section
          ref={catalogSectionRef}
          className={styles.premiumCatalogSection}
          onMouseMove={handleCatalogMouseMove}
          onMouseLeave={handleCatalogMouseLeave}
        >
          <div className={styles.premiumCatalogContainer}>
            <div ref={catalogHeaderRef} className={styles.sectionHeaderCatalog}>
              <span className={styles.catalogLabel}>PRODUCT CATEGORY</span>
              <div className={styles.headerLine} />
            </div>

            <div className={styles.premiumCatalogLayout}>
              {categoriesLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={styles.catalogColumnSkeleton}>
                    <div style={{ height: '36px', width: '80%', background: 'rgba(0,0,0,0.05)', marginBottom: '24px', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                    <div style={{ height: '80px', width: '100%', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
                  </div>
                ))
              ) : categories.length > 0 ? (
                categories.map((cat) => {
                  const isHovered = hoveredCategory === cat.slug;
                  return (
                    <Link href={`/products/${cat.slug}`} key={cat._id} className={styles.catalogColumnLink}>
                      <div
                        className={`${styles.catalogColumn} ${isHovered ? styles.catalogColumnActive : ""}`}
                        data-slug={cat.slug}
                        onMouseEnter={() => setHoveredCategory(cat.slug)}
                      >
                        {/* Hover Background Image & Overlay */}
                        <div className={styles.columnHoverBg}>
                          <Image
                            src={cat.imageUrl}
                            alt={cat.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className={styles.columnBgImage}
                          />
                          <div className={styles.columnBgOverlay} />
                        </div>

                        {/* Title & Plus Row */}
                        <div className={styles.categoryTitleRow}>
                          <h3 className={styles.catalogTitle}>{cat.name}</h3>
                          <span className={styles.plusSign}>+</span>
                        </div>

                        {/* Bottom Row - Text Swap */}
                        <div className={styles.bottomRow}>
                          <p className={styles.catalogDescription}>
                            {CATEGORY_DESCRIPTIONS[cat.slug] || cat.description}
                          </p>
                          <span className={styles.exploreCategoryText}>
                            Explore Category &rarr;
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div style={{ textAlign: "center", width: "100%", color: "var(--secondary-text)", padding: "40px" }}>
                  No categories available at the moment.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Heavy content sections loaded dynamically on client-side to improve loading speeds */}
        <DifferenceSection />
        <ValuePropSection />
        <InstitutionTrustSection />
      </main>

      <PremiumFooter />
    </div>
  );
}
