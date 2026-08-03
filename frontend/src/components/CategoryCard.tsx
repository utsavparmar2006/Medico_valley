'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './CategoryCard.module.css';

interface Category {
  _id: string;
  name: string;
  slug: string;
  imageUrl: string;
}

interface CardData extends Category {
  productImage: string;
}

interface CategoryCardProps {
  cat: CardData;
  index: number;
}

export default function CategoryCard({ cat, index }: CategoryCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const cardRef = useRef<HTMLAnchorElement | null>(null);

  // Reset hover state when touch happens outside
  useEffect(() => {
    if (!hovered) return;
    const handleClickOutside = (e: TouchEvent | MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setHovered(false);
      }
    };
    document.addEventListener('touchstart', handleClickOutside);
    return () => document.removeEventListener('touchstart', handleClickOutside);
  }, [hovered]);

  const handleClick = (e: React.MouseEvent) => {
    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    if (isTouch && !hovered) {
      e.preventDefault();
      setHovered(true);
    }
  };

  const animStyle: React.CSSProperties = {
    animation: `cardIn 0.5s ease both`,
    animationDelay: `${index * 0.1}s`,
  };

  return (
    <Link
      ref={cardRef}
      href={`/products/${cat.slug}`}
      id={cat.slug}
      className={`${styles.cardContainer} ${hovered ? styles.cardContainerHovered : ''}`}
      style={animStyle}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top Image Canvas Container */}
      <div className={styles.imageWrap}>
        {(cat.imageUrl || cat.productImage) && !imgError ? (
          <div className={styles.imageInner}>
            <Image
              src={cat.imageUrl || cat.productImage}
              alt={cat.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              style={{
                objectFit: 'contain',
                objectPosition: 'center',
                mixBlendMode: 'multiply',
              }}
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          /* Fallback gradient placeholder */
          <div style={{
            width: '100%',
            height: '100%',
            background: `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '12px',
          }}>
            <span style={{ fontSize: '3rem', opacity: 0.3, color: '#ffffff' }}>⊕</span>
          </div>
        )}
      </div>

      {/* Bottom Category Info Banner */}
      <div className={styles.infoBanner}>
        <h2 className={styles.title}>
          {cat.name}
        </h2>

        {/* EXPLORE → Action Badge */}
        <div className={styles.exploreRow}>
          <span>EXPLORE</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
