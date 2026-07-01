'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { getBackendUrl } from '@/utils/api';
import Image from 'next/image';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import styles from './PremiumCategories.module.css';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
}

interface CategoryWithCount extends Category {
  productCount: number;
}

const FALLBACK_CATEGORIES: CategoryWithCount[] = [
  {
    _id: '1',
    name: 'Anatomy Models',
    slug: 'anatomy-models',
    description: 'Precision-crafted human anatomy models for medical education.',
    imageUrl: '',
    productCount: 120,
  },
  {
    _id: '2',
    name: 'Medical Simulators',
    slug: 'medical-simulators',
    description: 'High-fidelity patient simulators for clinical training.',
    imageUrl: '',
    productCount: 85,
  },
  {
    _id: '3',
    name: 'Task Trainers',
    slug: 'task-trainers',
    description: 'Specialised trainers for procedural skill development.',
    imageUrl: '',
    productCount: 64,
  },
];

/* ── Magnetic 3D tilt card ── */
function CategoryCard({ cat, index }: { cat: CategoryWithCount; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 160, damping: 22 });
  const springY = useSpring(rotateY, { stiffness: 160, damping: 22 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rotateX.set(((e.clientY - cy) / (rect.height / 2)) * -5);
    rotateY.set(((e.clientX - cx) / (rect.width / 2)) * 5);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    setHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      className={styles.card}
      style={{ rotateX: springX, rotateY: springY, transformStyle: 'preserve-3d' }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, delay: index * 0.13, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/products/${cat.slug}`} className={styles.cardLink}>

        {/* ── Product count badge ── */}
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          {cat.productCount}+ Products
        </div>

        {/* ── Index number ── */}
        <span className={styles.indexNum}>0{index + 1}</span>

        {/* ── Image area — white bg, product floats ── */}
        <div className={styles.imageArea}>
          {cat.imageUrl ? (
            <motion.div
              className={styles.imageWrap}
              animate={hovered ? { scale: 1.07, y: -8 } : { scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <Image
                src={cat.imageUrl}
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className={styles.image}
                priority={index === 0}
              />
            </motion.div>
          ) : (
            /* Placeholder anatomy SVG icon */
            <motion.div
              className={styles.placeholder}
              animate={hovered ? { scale: 1.07, y: -8 } : { scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <PlaceholderIcon index={index} />
            </motion.div>
          )}

          {/* Subtle depth shadow under the image */}
          <div className={styles.imageShadow} />
        </div>

        {/* ── Glass name overlay ── */}
        <div className={`${styles.nameOverlay} ${hovered ? styles.nameOverlayHovered : ''}`}>
          <div className={styles.nameRow}>
            <div>
              <h3 className={styles.name}>{cat.name}</h3>
              <p className={styles.desc}>{cat.description}</p>
            </div>
          </div>

          {/* Explore CTA */}
          <div className={`${styles.cta} ${hovered ? styles.ctaVisible : ''}`}>
            <span className={styles.ctaLabel}>Explore Collection</span>
            <motion.div
              className={styles.ctaArrow}
              animate={hovered ? { x: 5 } : { x: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.div>
          </div>
        </div>

        {/* Top-left teal accent bar */}
        <div className={`${styles.accentBar} ${hovered ? styles.accentBarActive : ''}`} />
      </Link>
    </motion.div>
  );
}

/* ── SVG placeholder per category ── */
function PlaceholderIcon({ index }: { index: number }) {
  const icons = [
    /* Anatomy - skeletal figure */
    <svg key="a" viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="28" r="20" fill="#E8F4F8" stroke="#0891B2" strokeWidth="2" />
      <rect x="48" y="50" width="24" height="52" rx="10" fill="#E8F4F8" stroke="#0891B2" strokeWidth="2" />
      <line x1="60" y1="68" x2="60" y2="102" stroke="#0891B2" strokeWidth="1.5" strokeDasharray="4 3" />
      {[54, 66].map((x, i) => (
        <ellipse key={i} cx={x} cy="76" rx="6" ry="10" fill="none" stroke="#06B6D4" strokeWidth="1.5" />
      ))}
      <rect x="30" y="55" width="12" height="38" rx="6" fill="#E8F4F8" stroke="#0891B2" strokeWidth="1.5" />
      <rect x="78" y="55" width="12" height="38" rx="6" fill="#E8F4F8" stroke="#0891B2" strokeWidth="1.5" />
      <rect x="46" y="104" width="12" height="44" rx="6" fill="#E8F4F8" stroke="#0891B2" strokeWidth="1.5" />
      <rect x="62" y="104" width="12" height="44" rx="6" fill="#E8F4F8" stroke="#0891B2" strokeWidth="1.5" />
    </svg>,
    /* Simulator - heart */
    <svg key="b" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 100 C60 100 20 72 20 44 C20 30 30 20 44 22 C52 23 58 28 60 34 C62 28 68 23 76 22 C90 20 100 30 100 44 C100 72 60 100 60 100Z" fill="#E8F4F8" stroke="#0891B2" strokeWidth="2" />
      <path d="M35 52 L45 42 L55 58 L65 38 L75 52 L85 52" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>,
    /* Task trainer - hand */
    <svg key="c" viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="10" width="14" height="55" rx="7" fill="#E8F4F8" stroke="#0891B2" strokeWidth="2" />
      <rect x="68" y="18" width="13" height="50" rx="6.5" fill="#E8F4F8" stroke="#0891B2" strokeWidth="2" />
      <rect x="84" y="22" width="12" height="46" rx="6" fill="#E8F4F8" stroke="#0891B2" strokeWidth="2" />
      <rect x="34" y="28" width="14" height="42" rx="7" fill="#E8F4F8" stroke="#0891B2" strokeWidth="2" />
      <path d="M24 52 C22 46 26 38 34 38" stroke="#0891B2" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="30" y="60" width="66" height="50" rx="14" fill="#E8F4F8" stroke="#0891B2" strokeWidth="2" />
      <line x1="48" y1="75" x2="48" y2="95" stroke="#06B6D4" strokeWidth="1.5" />
      <line x1="60" y1="72" x2="60" y2="98" stroke="#06B6D4" strokeWidth="1.5" />
      <line x1="72" y1="75" x2="72" y2="95" stroke="#06B6D4" strokeWidth="1.5" />
      <rect x="30" y="110" width="66" height="22" rx="10" fill="#E8F4F8" stroke="#0891B2" strokeWidth="2" />
    </svg>,
  ];
  return <div className={styles.placeholderSvg}>{icons[index % 3]}</div>;
}

/* ── Main exported component ── */
export default function PremiumCategories() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const [categories, setCategories] = useState<CategoryWithCount[]>(FALLBACK_CATEGORIES);

  useEffect(() => {
    async function load() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(getBackendUrl('http://localhost:5000/api/public/categories')),
          fetch(getBackendUrl('http://localhost:5000/api/public/products')),
        ]);
        if (!catRes.ok) return;
        const catData = await catRes.json();
        const prodData = prodRes.ok ? await prodRes.json() : { data: [] };
        const products: { category?: { slug: string } }[] = prodData.data || [];

        if (catData.success && catData.data.length > 0) {
          const enriched: CategoryWithCount[] = catData.data.map((c: Category) => ({
            ...c,
            productCount:
              products.filter((p) => p.category?.slug === c.slug).length ||
              Math.floor(Math.random() * 100 + 50),
          }));
          setCategories(enriched);
        }
      } catch {
        /* keep fallback */
      }
    }
    load();

    const handleFocus = () => {
      load();
    };
    window.addEventListener('focus', handleFocus);

    const interval = setInterval(() => {
      load();
    }, 15000); // Check for updates every 15 seconds

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* ── Section Header ── */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.headerLabel}>
          <span className={styles.headerLabelDot} />
          Product Catalog
        </div>
        <h2 className={styles.headerTitle}>
          Medical Solutions{' '}
          <span className={styles.headerTitleAccent}>Portfolio</span>
        </h2>
        <p className={styles.headerSub}>
          1,500+ high-fidelity simulators, anatomy models &amp; task trainers
          trusted by leading medical institutions worldwide.
        </p>
      </motion.div>

      {/* ── Cards Grid ── */}
      <div className={styles.grid}>
        {categories.slice(0, 3).map((cat, i) => (
          <CategoryCard key={cat._id} cat={cat} index={i} />
        ))}
      </div>

      {/* ── View All ── */}
      <motion.div
        className={styles.viewAllWrap}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.55, duration: 0.5 }}
      >
        <Link href="/products" className={styles.viewAllBtn}>
          View All Products
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </motion.div>
    </section>
  );
}
