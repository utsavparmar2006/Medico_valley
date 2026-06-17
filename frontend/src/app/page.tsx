"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./page.module.css";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  productCount?: number;
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

function ProductShowcaseCard({
  product,
  categorySlug,
  onMouseEnter,
  onMouseLeave,
}: {
  product: Product;
  categorySlug: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const floatDelayRef = useRef(Math.random() * -5);
  
  // Motion values for tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const tiltSpringConfig = { stiffness: 200, damping: 25 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [4, -4]), tiltSpringConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-4, 4]), tiltSpringConfig);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const cursorX = (e.clientX - rect.left) / width - 0.5;
    const cursorY = (e.clientY - rect.top) / height - 0.5;
    x.set(cursorX);
    y.set(cursorY);
  };
  
  const handleMouseLeaveCard = () => {
    x.set(0);
    y.set(0);
    onMouseLeave();
  };

  const productImg = product.mediaUrls && product.mediaUrls.length > 0 
    ? product.mediaUrls[0] 
    : "https://lh3.googleusercontent.com/aida-public/AB6AXuBs1TJS_og_wI-Vgf8amUYZ8jMOJXbvvzhkgtYWdpXQ41nUoq34vTzrXjerJGX04Wx_PPJI2jJurr9BajPereCDYAzIYKr0QBmXHQexjwrDJBZrMBbZMd9c4UHX1gtem_oMMPzbsUzRhbjrMBnjTePZubZOJAGHB9FO5WPFiLHdNyEC0mizXsFRj0GWZhQrOJ936uRrT2rGwO0Cs3WVFmWSPXCmN2_cFfVLe1l_XpJVaprHkIrPpqxwnTFLPV9a9QOWacr_gK8RK-jY";

  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: floatDelayRef.current
      }}
      style={{ display: "flex", flexShrink: 0 }}
    >
      <Link href={`/products/${categorySlug}/${product.slug}`} style={{ textDecoration: "none" }}>
        <motion.div
          ref={cardRef}
          className={styles.productCard}
          onMouseMove={handleMouseMove}
          onMouseEnter={onMouseEnter}
          onMouseLeave={handleMouseLeaveCard}
          style={{
            rotateX: rotateX,
            rotateY: rotateY,
          }}
          whileHover="hover"
          variants={{
            initial: {
              y: 0,
              boxShadow: "0 10px 30px rgba(11, 31, 58, 0.02)",
              borderColor: "rgba(255, 255, 255, 0.4)",
            },
            hover: {
              y: -12,
              boxShadow: "0 25px 50px rgba(15, 111, 255, 0.16)",
              borderColor: "rgba(15, 111, 255, 0.3)",
            }
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className={styles.productCardInner}>
            <div className={styles.productImageWrapper}>
              {productImg.endsWith(".mp4") ? (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b1f3a" }}>
                  <span style={{ color: "white", fontSize: "14px", fontWeight: 600 }}>🎬 Video Preview</span>
                </div>
              ) : (
                <motion.div 
                  style={{ position: "relative", width: "100%", height: "100%" }}
                  variants={{
                    initial: { scale: 1 },
                    hover: { scale: 1.05 }
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <Image
                    src={productImg}
                    alt={product.name}
                    fill
                    sizes="320px"
                    loading="lazy"
                  />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Showcase Explorer State
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [productsCache, setProductsCache] = useState<Record<string, Product[]>>({});
  const [loadingProducts, setLoadingProducts] = useState<Record<string, boolean>>({});
  const [showcaseHoverLabel, setShowcaseHoverLabel] = useState<string | null>(null);

  // Refs for infinite marquee & transitions
  const showcaseRef = useRef<HTMLDivElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);
  const marqueeTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Helper to format category title for giant backdrop text
  const getBackdropText = (cat: Category | null) => {
    if (!cat) return "";
    const name = cat.name.toLowerCase();
    if (name.includes("anatomy")) return "ANATOMY";
    if (name.includes("simulator")) return "SIMULATORS";
    if (name.includes("task trainer")) return "TASK TRAINERS";
    if (name.includes("virtual reality") || name.includes("vr")) return "VR TRAINING";
    return cat.name.toUpperCase();
  };

  // Fetch products for a specific category slug
  const fetchProductsForCategory = async (slug: string) => {
    if (productsCache[slug] || loadingProducts[slug]) return;

    setLoadingProducts((prev) => ({ ...prev, [slug]: true }));
    try {
      const res = await fetch(`http://localhost:5000/api/public/categories/${slug}/products`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProductsCache((prev) => ({ ...prev, [slug]: data.data }));
        }
      }
    } catch (err) {
      console.error(`Error fetching products for category ${slug}:`, err);
    } finally {
      setLoadingProducts((prev) => ({ ...prev, [slug]: false }));
    }
  };

  // Hover Category Switch Animation (GSAP)
  const handleCategoryHover = (cat: Category) => {
    if (activeCategory?._id === cat._id) return;

    // Start pre-fetching products for the hovered category immediately
    fetchProductsForCategory(cat.slug);

    if (showcaseRef.current) {
      // Exit animation: fade, slide left (-50px) and blur (10px) over 0.28s
      gsap.to(showcaseRef.current, {
        opacity: 0,
        x: -50,
        filter: "blur(10px)",
        duration: 0.28,
        ease: "power2.in",
        onComplete: () => {
          // Content swap
          setActiveCategory(cat);
        }
      });
    } else {
      setActiveCategory(cat);
    }
  };

  // Hover marquee pause handlers (smooth timeScale slow down / speed up)
  const handleCardMouseEnter = () => {
    if (activeCategory) {
      setShowcaseHoverLabel(`Explore ${activeCategory.name}`);
    }
  };

  const handleCardMouseLeave = () => {
    setShowcaseHoverLabel(null);
  };

  // Auto-select first category and fetch its products on mount
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      const firstCat = categories[0];
      setActiveCategory(firstCat);
      fetchProductsForCategory(firstCat.slug);
    }
  }, [categories, activeCategory]);

  // Showcase Entry and Marquee Loop (GSAP Timeline)
  useEffect(() => {
    if (!activeCategory) return;
    const slug = activeCategory.slug;
    const isLoaded = !loadingProducts[slug] && productsCache[slug];

    if (isLoaded && showcaseRef.current) {
      // 1. Showcase Enter Animation: slide from right (50px), fade in, unblur (10px -> 0) over 0.45s
      gsap.fromTo(showcaseRef.current,
        { opacity: 0, x: 50, filter: "blur(10px)" },
        { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.45, ease: "power2.out" }
      );

      // 2. Setup horizontal marquee timeline with duplicated content loop
      const timeoutId = setTimeout(() => {
        if (!marqueeTrackRef.current) return;

        // Clean up previous timeline
        if (marqueeTimelineRef.current) {
          marqueeTimelineRef.current.kill();
        }

        const tl = gsap.timeline({
          repeat: -1,
          defaults: { ease: "none" }
        });

        // Loop the track horizontally by translation offset of -50% (exactly 1 group width)
        tl.to(marqueeTrackRef.current, {
          xPercent: -50,
          duration: 25, // constant marquee speed
        });

        marqueeTimelineRef.current = tl;
      }, 50);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [activeCategory, productsCache, loadingProducts]);

  // Ambient floating animation using GSAP (subtle luxury gallery feel)
  useEffect(() => {
    if (showcaseRef.current) {
      const floatTween = gsap.to(showcaseRef.current, {
        y: "+=6",
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });

      return () => {
        floatTween.kill();
      };
    }
  }, [activeCategory]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("http://localhost:5000/api/public/categories");
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
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    if (!videoSrc) {
      setVideoSrc(
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCREgsadcr_TnTpTTSPJ4Gtl_U573W4x0lnIIKnVSbBAItgfpvUWAcfWcMZPurldeLU9s3VU51tm7cZbkjzhhzwIWISx-HEQYyu0RFNkPhdzsrQiI0GZaoGFbF9PhlZYzbXtj6UrfwCVlv7qXrbe0HNFPFlvCu-IZbCWSeQxd6Ng2yJQjr5RLvMvAZmchmcGbUh2oygzqn-2jYsx0wWtiYmF6Ik0QmjjVTCCkWPJ1qeZRCzhivDinTNrM3-V0ZPXargx0FBkjwypbUh"
      );
    } else {
      if (videoRef.current) {
        videoRef.current.play().catch((err) => console.log("Video playback error", err));
      }
    }
    setIsHovered(true);
  };

  // Play/pause handler when source is dynamically bound
  useEffect(() => {
    if (videoSrc && videoRef.current) {
      if (isHovered) {
        videoRef.current.load();
        videoRef.current.play().catch((err) => console.log("Video playback error on load:", err));
      } else {
        videoRef.current.pause();
      }
    }
  }, [videoSrc, isHovered]);

  // GSAP Animations
  useGSAP(
    () => {
      // Check prefers-reduced-motion
      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const heroTl = gsap.timeline();

      if (isReduced) {
        // If reduced motion is preferred, simple fade in
        heroTl.fromTo(
          `.${styles.heroGlassPanel}`,
          { opacity: 0 },
          { opacity: 1, duration: 1.2, ease: "power2.out" }
        );
      } else {
        // 1. Hero Glass Card reveal
        heroTl.fromTo(
          `.${styles.heroGlassPanel}`,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }
        );

        // 2. Tagline animates up
        heroTl.fromTo(
          `.${styles.heroTagline}`,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          "-=0.4"
        );

        // 3. Headline stagger word-by-word
        heroTl.fromTo(
          ".hero-word",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: "power3.out" },
          "-=0.3"
        );

        // 4. Subtitle fade up
        heroTl.fromTo(
          `.${styles.heroSubtitle}`,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "-=0.4"
        );

        // 5. CTA Wrapper buttons slide in
        heroTl.fromTo(
          `.${styles.heroCtaWrapper}`,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" },
          "-=0.4"
        );
      }

      // Parallax Scroll on Hero Video
      gsap.to(`.${styles.heroVideo}`, {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: `.${styles.heroSection}`,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // SplitText heading word reveal animation
      gsap.fromTo(
        headingRef.current?.querySelectorAll(".heading-word") || [],
        { yPercent: 100, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );

      // Background floating symbols drift
      gsap.to(`.${styles.floatingSymbol}`, {
        y: "+=20",
        rotation: 12,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        stagger: 1
      });

      // Section Reveal Animations (ScrollTrigger)
      const sections = document.querySelectorAll(
        `.${styles.sectionGap}, .${styles.labGalleryGrid}, .${styles.valuePropSection}, .${styles.carouselSection}, .${styles.networkSection}`
      );

      sections.forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 80 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    },
    { scope: containerRef }
  );

  // Carousel scroll helpers
  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      carouselRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div ref={containerRef} className={styles.pageWrapper}>
      {/* TopNavBar */}
      <motion.header
        className={styles.fixedHeader}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className={styles.logo}>Delta Healthcare</div>
        <nav className={styles.navLinks}>
          <a className={styles.navLinkActive} href="#">
            About
          </a>
          <a className={styles.navLink} href="#">
            Products
          </a>
          <a className={styles.navLink} href="#">
            Blog
          </a>
        </nav>
        <div className={styles.navActions}>
          <button className={`${styles.iconBtn} material-symbols-outlined`}>
            search
          </button>
          <div className={styles.iconBtn}>
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className={styles.cartBadge}>0</span>
          </div>
          <motion.button
            className={styles.loginBtn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Login
          </motion.button>
        </div>
      </motion.header>

      <main className={styles.mainContent}>
        {/* Hero Section - Rebuilt with premium interactions */}
        <section
          className={`${styles.heroSection} ${isHovered ? styles.heroSectionActive : ""}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
        >
          {/* Background Video (Programmatic Lazy Loading via null videoSrc) */}
          <video
            ref={videoRef}
            className={styles.heroVideo}
            loop
            muted
            playsInline
            preload="none"
            poster="https://lh3.googleusercontent.com/aida-public/AB6AXuBs1TJS_og_wI-Vgf8amUYZ8jMOJXbvvzhkgtYWdpXQ41nUoq34vTzrXjerJGX04Wx_PPJI2jJurr9BajPereCDYAzIYKr0QBmXHQexjwrDJBZrMBbZMd9c4UHX1gtem_oMMPzbsUzRhbjrMBnjTePZubZOJAGHB9FO5WPFiLHdNyEC0mizXsFRj0GWZhQrOJ936uRrT2rGwO0Cs3WVFmWSPXCmN2_cFfVLe1l_XpJVaprHkIrPpqxwnTFLPV9a9QOWacr_gK8RK-jY"
          >
            {videoSrc && <source src={videoSrc} type="video/mp4" />}
          </video>

          {/* Content Overlay */}
          <div className={styles.heroOverlay} />
          <div className={styles.heroDepthGrid} />
          <div className={styles.heroDiagnosticTrace} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          {/* Floating Medical Icons with parallax depth layers */}
          {/* Icon 1: Heartbeat pulse line (Layer 1 - moves faster opposite) */}
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

          {/* Icon 2: Medical Cross (Layer 2 - moves slower same direction) */}
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

          {/* Icon 3: Pill (Layer 1 - moves faster opposite) */}
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

          {/* Icon 4: Shield with Cross (Layer 2 - moves slower same direction) */}
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
            <div className={styles.heroPanelEdgeGlow} />

            <span className={styles.heroTagline} style={{ transform: "translateZ(30px)" }}>
              <span className={styles.heroTaglineDot} />
              Advanced Medical Simulation
            </span>

            {/* Word-by-word headline layout */}
            <h1 className={styles.heroTitle} style={{ transform: "translateZ(50px)" }}>
              {"World-Class Healthcare. Trusted Globally.".split(" ").map((word, i) => {
                const isHighlighted = i >= 2; // "Trusted Globally."
                return (
                  <span
                    key={i}
                    className={`hero-word ${isHighlighted ? styles.heroHighlight : ""}`}
                    style={{ display: "inline-block", marginRight: "0.25em" }}
                  >
                    {word}
                  </span>
                );
              })}
            </h1>

            <p className={styles.heroSubtitle} style={{ transform: "translateZ(40px)" }}>
              Experience state-of-the-art medical models and clinical simulations. Guided by technology, crafted for surgical precision, trusted by clinical professionals worldwide.
            </p>

            <div className={styles.heroTrustRow} style={{ transform: "translateZ(42px)" }}>
              <div className={styles.heroTrustItem}>
                <strong>1500+</strong>
                <span>Training tools</span>
              </div>
              <div className={styles.heroTrustItem}>
                <strong>3B</strong>
                <span>Scientific partner</span>
              </div>
              <div className={styles.heroTrustItem}>
                <strong>India</strong>
                <span>Clinical network</span>
              </div>
            </div>

            {/* Magnetic Button + secondary CTA */}
            <div className={styles.heroCtaWrapper} style={{ transform: "translateZ(45px)" }}>
              <motion.button
                ref={btnRef}
                onMouseMove={handleBtnMouseMove}
                onMouseLeave={handleBtnMouseLeave}
                style={{ x: springBtnX, y: springBtnY }}
                className={styles.ctaButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Book Appointment</span>
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
              <button className={styles.secondaryCtaButton}>
                Explore Solutions
              </button>
            </div>
          </motion.div>

          {/* Scroll Prompt */}
          <div className={styles.heroScrollIndicator}>
            <span>Hover to play preview</span>
            <div className={styles.scrollLine} />
          </div>
        </section>

        {/* Premium Product Showcase Explorer Section */}
        <section className={styles.explorerSection}>
          {/* Immersive Background Elements */}
          <div className={styles.meshBg} />
          <div className={styles.lightSweep} />
          <div className={styles.radialGlow} />

          {/* Floating Medical Symbols */}
          <div className={styles.floatingSymbol} style={{ top: "15%", left: "5%", transform: "scale(1.2)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5v14" />
            </svg>
          </div>
          <div className={styles.floatingSymbol} style={{ bottom: "10%", right: "8%", transform: "scale(1.5)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>

          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Explore Our Range</span>
            <h2 className={styles.sectionTitle} ref={headingRef}>
              {"Cutting-edge Learning Portals".split(" ").map((word, idx) => (
                <span key={idx} className={styles.splitWord}>
                  <span className={`${styles.splitWordInner} heading-word`}>
                    {word}&nbsp;
                  </span>
                </span>
              ))}
            </h2>
            <div className={styles.divider}></div>
          </div>

          <div className={styles.explorerLayout}>
            {/* Left Side Navigation (Responsive Layout: Vertical on desktop, horizontal tabs on mobile/tablet) */}
            <div className={styles.categoryMenu}>
              {categoriesLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={styles.categoryItem} style={{ opacity: 0.5, pointerEvents: 'none' }}>
                    <div style={{ width: "24px", height: "24px", background: "rgba(0,0,0,0.05)", borderRadius: "50%", animation: "pulseMarquee 1.5s infinite" }} />
                    <div style={{ width: "120px", height: "16px", background: "rgba(0,0,0,0.05)", borderRadius: "4px", animation: "pulseMarquee 1.5s infinite" }} />
                  </div>
                ))
              ) : categories.length > 0 ? (
                categories.map((cat) => {
                  const isActive = activeCategory?._id === cat._id;
                  return (
                    <button
                      key={cat._id}
                      className={`${styles.categoryItem} ${isActive ? styles.categoryItemActive : ""}`}
                      onMouseEnter={() => handleCategoryHover(cat)}
                      onClick={() => handleCategoryHover(cat)}
                    >
                      <motion.span
                        className="material-symbols-outlined"
                        style={{ fontSize: "20px" }}
                        animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                        transition={isActive ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
                      >
                        {getCategoryIcon(cat.slug)}
                      </motion.span>
                      <span>{cat.name}</span>
                      {cat.productCount !== undefined && (
                        <span className={styles.itemCount}>
                          ({cat.productCount})
                        </span>
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="activeCategoryIndicator"
                          className={styles.indicatorLine}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })
              ) : (
                <div style={{ color: "var(--secondary-text)" }}>No categories available.</div>
              )}
            </div>

            {/* Right Side: Horizontal Infinite Showcase Area */}
            <div className={styles.showcaseArea} ref={showcaseRef}>
              {/* Giant backdrop faded title text */}
              <div className={styles.giantBackdropText}>
                {getBackdropText(activeCategory)}
              </div>
              <AnimatePresence>
                {showcaseHoverLabel && (
                  <motion.div
                    className={styles.showcaseHoverLabel}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                  >
                    <span>{showcaseHoverLabel}</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {activeCategory && loadingProducts[activeCategory.slug] ? (
                <div className={styles.marqueeContainer}>
                  <div className={styles.marqueeTrack}>
                    <div className={styles.marqueeGroup}>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className={styles.skeletonCard}>
                          <div className={styles.skeletonImage} />
                          <div className={styles.skeletonText1} />
                          <div className={styles.skeletonText2} />
                          <div className={styles.skeletonText3} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : activeCategory && productsCache[activeCategory.slug]?.length > 0 ? (
                <div className={styles.marqueeContainer}>
                  <div className={styles.marqueeTrack} ref={marqueeTrackRef}>
                    {/* Render standard items group */}
                    <div className={styles.marqueeGroup}>
                      {productsCache[activeCategory.slug].map((prod) => (
                        <ProductShowcaseCard
                          key={prod._id}
                          product={prod}
                          categorySlug={activeCategory.slug}
                          onMouseEnter={handleCardMouseEnter}
                          onMouseLeave={handleCardMouseLeave}
                        />
                      ))}
                    </div>
                    {/* Render duplicated items group for seamless looping */}
                    <div className={styles.marqueeGroup}>
                      {productsCache[activeCategory.slug].map((prod) => (
                        <ProductShowcaseCard
                          key={`${prod._id}-duplicate`}
                          product={prod}
                          categorySlug={activeCategory.slug}
                          onMouseEnter={handleCardMouseEnter}
                          onMouseLeave={handleCardMouseLeave}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "80px 0", color: "var(--secondary-text)" }}>
                  No products available in this category.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Lab Gallery Grid */}
        <section className={styles.labGalleryGrid}>
          {/* Anatomy Lab */}
          <div className={styles.labItem}>
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdDnmYqOxV0afMg_SRE3mBaeKUiHFHEVsoRMmm279ZYlovmxNeSN8hgpyFDNuoWhUlLwMi5eZMAhjHehuvirFJxCg-akHku3wli3uV_9_JNunROOZwx7i7Ak69d5DVlGoaeTOyljqhJxW4MuXYEhUQgHLvZTCta-huwy7nIF3IecnPpaqQwYesKzhGQ1N1jU-v1YV0Npu20gmFNGVa2K5NtyUlGmjxj9yCzPGDNdRrv8-_fIGAwQggqFcPboKA3uR-unCSb26_9I8O"
              alt="Anatomy Lab"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.labImage}
            />
            <div className={styles.labOverlay}>
              <span className={styles.labTagline}>Core Science</span>
              <h2 className={styles.labTitle}>
                Anatomy
                <br />
                Lab
              </h2>
              <button className={styles.labBtn}>Explore Lab</button>
            </div>
          </div>

          {/* Nursing Skills Lab */}
          <div className={`${styles.labItem} ${styles.labItemRight}`}>
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOaASQaZjMerCUH9PlxA7Sh2rN-fcNtj85pMiLwJtNtwTzEYLXOuB310_msHP1mGuZVYHp4aHpVOK8OureyC0JuxdH8KqCWS3qaRooN41y-oYzIb7OqekCDyh7cS16gk2fwtnjsS-rm2P0pIcy3zhJe3e2fs9sT1oFyUEsb2Uf4T9hSP1KyTpKn5ENImhoMWc1qzf7067JuwTRuSzMDcuUYxuexevR9UqKWRZDnxB_sGuJQVJYYIxqp8SPQOh1wnXFccbRH-wGQc-j"
              alt="Nursing Skills Lab"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.labImage}
            />
            <div className={styles.labOverlay}>
              <span className={styles.labTagline}>Clinical Care</span>
              <h2 className={styles.labTitle}>
                Nursing
                <br />
                Skills Lab
              </h2>
              <button className={styles.labBtn}>Explore Lab</button>
            </div>
          </div>

          {/* Ayurvedic Lab */}
          <div className={styles.labItem}>
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0thArLs7136_o-GBdQCzrn9auocbf1Csy50a5pnPolpwMkKX1Iqx8YtRqxKnr0x3ZHXn6RI3bL9fp0vAbtQ6LsiqnAJ-v-OVW2QIE4RdEvholada_y7oa2I4kTyNR-Fi8gCEoR8JPyDW6wPi3Bs6w2URJclbNmB1g_EdTizJ2z3cTjYgLHtUHwkrxrjkHHa44WDDYzB1T3wSHC58PcJej71Rs_iN-AuTP_Qzl-9mnctexD7weGEuvyEX_Sk0YM3p9ub97P3kwYAdg"
              alt="Ayurvedic Lab"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.labImage}
            />
            <div className={styles.labOverlay}>
              <span className={styles.labTagline}>Traditional Medicine</span>
              <h2 className={styles.labTitle}>
                Ayurvedic
                <br />
                Lab
              </h2>
              <button className={styles.labBtn}>Explore Lab</button>
            </div>
          </div>

          {/* Homeopathy Lab */}
          <div className={`${styles.labItem} ${styles.labItemRight}`}>
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuChFQcvn3-ES52C2QE67lnzhPrP0uaqw6cvRCTVUnXDqDFOv5D6z3x_OWVXA2KrHp8JNfRyw67eyXGa_LS_NUFSJb5MPChadITjdbozt4QzRYojyFnoE45i9_2atGDIQtdjEG5xmHbVz-XmqCO4U5WNbiBwaI8pufzqbQnSrQdmQmRD7yaaLH8Br1ctnD-F6_g7oVC1izXs8rk5EBmJtbrAfi5VCXX0H6doZe2_geMKoc3cu7WlgiIwvwwyZpgyqAQ6eM6lBAIO34Y9"
              alt="Homeopathy Lab"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.labImage}
            />
            <div className={styles.labOverlay}>
              <span className={styles.labTagline}>Holistic Education</span>
              <h2 className={styles.labTitle}>
                Homeopathy
                <br />
                Lab
              </h2>
              <button className={styles.labBtn}>Explore Lab</button>
            </div>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className={styles.valuePropSection}>
          <div className={styles.valuePropGrid}>
            <div className={styles.imageWrapper}>
              <div className={styles.glowCircle}></div>
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJ5Gr9U0xZ8dO0rDp65g52BDrekWrWBjvt1qBIwlA6jx4Rb2kxx-4B_9rXHDcSVEjqwNNYtQ_hybJpekdAefcIlnxM8pXR_Iwbkf8kUBr0v2MglA4p_zeqnwwSSF89yHrZX7Cza2pX7hnWTQ2zWUK3-pDgFrKPJD7D9C7xqwjuoZVFmuxIPfxsjDA11OGBFNn5sOZq6w_hl5tyUC-Rx68oZn5XKQZGnqD3n5lkjMeV2HONdE24Ei7YZqD1R-RMPqJ10YFhcK9DcQAG"
                alt="Value Proposition Diagram"
                width={600}
                height={450}
                className={styles.propImage}
              />
              <div className={styles.statBadge}>
                <p className={styles.statNum}>97%</p>
                <p className={styles.statLabel}>Anatomy Affinity</p>
              </div>
            </div>
            <div className={styles.contentWrapper}>
              <div className={styles.propHeader}>
                <span className={styles.propLabel}>Unmatched Precision</span>
                <h2 className={styles.propTitle}>
                  Bringing Real-World Anatomy to the Lab.
                </h2>
              </div>
              <p className={styles.propDesc}>
                All our products are developed by globally renowned suppliers. We
                are exclusive distributors for 3B Scientific, Lifecast, and
                Cardionics, ensuring the highest fidelity training tools
                available in INDIA.
              </p>
              <div className={styles.featuresList}>
                <div className={styles.featureItem}>
                  <div className={styles.featureIconBox}>
                    <span className="material-symbols-outlined">verified</span>
                  </div>
                  <div>
                    <h4 className={styles.featureTitle}>Unbreakable Materials</h4>
                    <p className={styles.featureDesc}>
                      High-grade Silicon and Thermoplastic Polymer composites.
                    </p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIconBox}>
                    <span className="material-symbols-outlined">extension</span>
                  </div>
                  <div>
                    <h4 className={styles.featureTitle}>Modular Learning</h4>
                    <p className={styles.featureDesc}>
                      Detachable parts for comprehensive physiological understanding.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Showcase Carousel */}
        <section className={styles.carouselSection}>
          <div className={styles.carouselGrid}>
            <div className={styles.carouselIntro}>
              <div className={styles.introText}>
                <span className={styles.sectionLabel}>Product Ecosystem</span>
                <h2 className={styles.sectionTitle}>1500+ Specialized Tools</h2>
                <p className={styles.cardDesc}>
                  From Simulated Patient Monitors to Advanced Trauma Life Support
                  systems, our catalog covers the entire spectrum of medical
                  education needs.
                </p>
              </div>
              <button className={styles.catalogBtn}>View Full Catalog</button>
            </div>
            <div className={styles.carouselOuter}>
              {/* Left Arrow */}
              <button
                onClick={() => scrollCarousel("left")}
                className={`${styles.navArrowBtn} ${styles.navArrowLeft}`}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {/* Carousel container */}
              <div
                ref={carouselRef}
                className={`${styles.carouselInner} no-scrollbar`}
              >
                {/* Carousel Items */}
                {[
                  "AB6AXuDyMJ39m7nhOmR0SmIl-1umL7BlY9GBDUzss6l-V7ONR1rx_55TLnBW9tQFrWyGA43L_knq10EPrAUa0wPo9KegOikBBSpMJmKBNlgCzB1D-0nBip831lqvpYcaqtSR-E5_N3VAA5MCceUgIOtbXdwpDeunw_vI-ymsnlvOtTq-oX8Aq3LZ3p6bUd4PzXF32GtbCt2qy5paUhTVgV1uN_KaudR_M7Cn-GHfPkZDj_uS17r-U6qgnYtuZIbMJ8YKW_H2_tGUcj1jFujY",
                  "AB6AXuAFim8xQP4kYOWzQeQ-30l-sJ4Z9wRAEikZtZEv2H_sm3nezFJaGNJ3zGXFP_f05MkpccqT4IbnD3PFJ0r3gElmiDc7ENuNb1spVydF-JpbCLgAiH5oQendjk3i12I92DFsP76ZCq6ZFwxFkrR9WRFP0WuWlUsPp6KuNe1gek-RXepvkenhoNqW-TqRG0SGps5t-_JseYybfey3w3SWgi5upKrv_Jcw8UIZtLM5H67so5SBwjddjo4eEGHxgyRqWbs5WHsfbBmMiN2x",
                  "AB6AXuA5LEWExhVXFOrOQvIOa86LCs_nx3Nb88TDF6fjs0FKq-T6oieMxX7rJOh2x9Ve552TYFRXeMvtzGtU_ILUOHdXURD4Mx6MywlhFl2BLcqv1jwXiI4QEle6IpV5O9GqXZOktPPdBYJJGFhdd9rXGksVZo8A_TvcfUsEmzcR64yG73MDHjppuK6MK0AIxYYqWemHWsbh4E1EaZTS1UUI6knVoawaA3a_l_0JfZi1n1i3RonEVyllZDGc6SGxI9aKKBd7GB-Ua5Y10_FF",
                  "AB6AXuCiXax1i8PLP9A_N62prhnWfEZj13Bo33cHHHHSLKr15NLwSuUhWXxbx-orEY_TQEIc5DSK3jCm1UpcNIbH2oozuXwoEq2A_HteM4CoxoUleoTc_KUJ98W065jt-DAduz-TOCcTTJekV5pxV8wHLp-U-RlDmlMrmXDHcTUCPPcAIoLKyx-RwojjRwU2STOJE-sKtAH5F9KnIcgAM6yPxNnuHYAsucA6v_Car4ceYFrD50vOPA7NcsvK1oET7gbTEzMfrrICYqxGdJ0M",
                  "AB6AXuBD0DK8IKf6mmFHV-5_rb5qr_nGoqIs0k2z-weh_zqK04CXgKBabviKSO8STJiNlZ0RsdOqewK-WEHokVEH1QpxhPcMafYgEW9iLijDLGah5VwtYGPlDWnxHvtnh6kLItrkzMdqwMHs4oyDGwLG8a41GWsq5UXvj3BWhsw1BpRix6zsxOjM_x-5FJGgE-uKtwApBil-MzHq2Gnj-b_PGh9BXqsv764SJrxlGBH5HvEfsj0UMntARIwWLyZru5GHdWYNdKnutGSfvQ1C",
                  "AB6AXuBTYilnFnA3dm_nstis92AeicpVL33vk3Fk7SDGhMj50fjqdHCJwHnz59zE66zbc6uqade42klvBYv-ZAY0VCCKfsmGL2OEoipT6KPAnfZXTWhxTc7af_KfHk0IlwywgOqnSEj-0dImHQg0lRrrXj0SkYSSRTlFrX0oespV2nUgtPghYj3O3bTmXF7NGtFEz08WePaJNYMYOCZEB4Yl4RBrUEtSfrkJm16uMkrBemhmT7nEbKN2lajZda91XEHd5Wctftz4V2X0uGcI",
                  "AB6AXuAoRCwbgur7qu6qRY381FbsjzjKjZzBhIV1dFP90EINyq2NSkXTAYVngehS6q7FrwemH22DeK94dpdjTTZN75XjgDSgW1KJd5z3f3ycEt-_1QWFNpWLijcUz3R6xXVB_o2lNGcNVvcUHKaJaTlMiuEc8CsWL0D-dUWc8Q4EzeRISuCKDPTLEtHgVTX84jL5mbbgUUY7NmLaJkCtG1sJOk_nrnXun90F9K8rcyfvPJgDEaNENhnGRHwiMotfa2qyfeXyhppPJ7VyIECo",
                ].map((imgId, idx) => (
                  <div key={idx} className={styles.carouselCard}>
                    <Image
                      src={`https://lh3.googleusercontent.com/aida-public/${imgId}`}
                      alt={`Product Tool ${idx + 1}`}
                      width={160}
                      height={160}
                      className={styles.cardImg}
                    />
                  </div>
                ))}
              </div>
              {/* Right Arrow */}
              <button
                onClick={() => scrollCarousel("right")}
                className={`${styles.navArrowBtn} ${styles.navArrowRight}`}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </section>

        {/* India Sales Network Section */}
        <section className={styles.networkSection}>
          <div className={styles.networkBg}>
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjgN1LZh6C37Axjnq9kzbzepN9v6j1geBTYWpKCibgOk0y2_AcxneIeElD0ceNSxSS5jlO2V1ODqCqNlIYd93J6Y7gJa52FISzGmjJtryCfTbFYlfidmRM9NTMvXfGVE7-Gs-eEOuZapjAPvyiis9EM4SpjRs6B07gd3tyuzs2QX5IDdlNc_kUnAT1aMLE3OZgCcaRYQSmZ81gt-O6_K8jxCExDDjWpD77er81Zli-ubYEXtIsTsmeZHCeP7tQLCrqhu5bmINSE8dD"
              alt="India Network Map"
              fill
              sizes="100vw"
              className={styles.networkMapImg}
            />
          </div>
          <div className={styles.networkContainer}>
            <div className={styles.networkGrid}>
              <div className={styles.networkColLeft}></div>
              <div className={styles.networkColRight}>
                <span className={styles.networkBadge}>National Presence</span>
                <h2 className={styles.networkTitle}>
                  Fostering
                  <br />
                  Advanced
                  <br />
                  Skills Lab
                </h2>
                <div className={styles.networkRightDescBox}>
                  <p className={styles.networkDescLead}>
                    Pioneering Skills Lab development across India, adhering to
                    strict council guidelines for Medical, Nursing, and Ayurvedic excellence.
                  </p>
                  <p className={styles.networkDescSecondary}>
                    Our network ensures that every medical institute has access to
                    the highest-fidelity simulation training, preparing the next
                    generation of healthcare professionals.
                  </p>
                  <button className={styles.partnerBtn}>Partner with us</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Multi-column Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrandCol}>
              <span className={styles.footerBrandTitle}>Delta Healthcare</span>
              <p className={styles.footerBrandDesc}>
                Setting the global standard for high-fidelity medical simulation
                and clinical education in India. Precision in every model.
              </p>
              <div className={styles.socialRow}>
                <a href="#" className={styles.socialCircle}>
                  <span className="material-symbols-outlined">share</span>
                </a>
                <a href="#" className={styles.socialCircle}>
                  <span className="material-symbols-outlined">group</span>
                </a>
              </div>
            </div>

            <div className={styles.footerLinksCol}>
              <h4 className={styles.footerColHeader}>Solutions</h4>
              <ul className={styles.footerLinksList}>
                <li>
                  <a href="#" className={styles.footerLink}>
                    Anatomy Models
                  </a>
                </li>
                <li>
                  <a href="#" className={styles.footerLink}>
                    Medical Simulators
                  </a>
                </li>
                <li>
                  <a href="#" className={styles.footerLink}>
                    Task Trainers
                  </a>
                </li>
                <li>
                  <a href="#" className={styles.footerLink}>
                    Virtual Reality Training
                  </a>
                </li>
              </ul>
            </div>

            <div className={styles.footerLinksCol}>
              <h4 className={styles.footerColHeader}>Company</h4>
              <ul className={styles.footerLinksList}>
                <li>
                  <a href="#" className={styles.footerLink}>
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className={styles.footerLink}>
                    Global Partners
                  </a>
                </li>
                <li>
                  <a href="#" className={styles.footerLink}>
                    Career
                  </a>
                </li>
                <li>
                  <a href="#" className={styles.footerLink}>
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div className={styles.footerLinksCol}>
              <h4 className={styles.footerColHeader}>Legal</h4>
              <ul className={styles.footerLinksList}>
                <li>
                  <a href="#" className={styles.footerLink}>
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className={styles.footerLink}>
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className={styles.footerLink}>
                    Shipping Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p className={styles.copyRightText}>
              © 2024 Delta Healthcare. Precision in Medical Education.
            </p>
            <div className={styles.langSelector}>
              <span className="material-symbols-outlined">language</span>
              <span>English (India)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
