'use client';

import { useState } from 'react';
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

  const animStyle: React.CSSProperties = {
    animation: `cardIn 0.5s ease both`,
    animationDelay: `${index * 0.1}s`,
  };

  return (
    <Link
      href={`/products/${cat.slug}`}
      id={cat.slug}
      className={`${styles.cardContainer} ${hovered ? styles.cardContainerHovered : ''}`}
      style={animStyle}
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
        <h2 className={styles.title}>{cat.name}</h2>
        <div className={styles.exploreRow}>
          <span>Explore Now</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
