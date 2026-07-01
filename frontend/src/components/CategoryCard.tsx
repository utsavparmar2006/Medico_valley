'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
    animation: `cardIn 0.6s ease both`,
    animationDelay: `${index * 0.12}s`,
  };

  return (
    <Link
      href={`/products/${cat.slug}`}
      id={cat.slug}
      style={{
        display: 'block',
        textDecoration: 'none',
        position: 'relative',
        borderRadius: '18px',
        overflow: 'hidden',
        background: 'transparent',
        transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'pointer',
        ...animStyle,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Floating image container */}
      <div style={{
        position: 'relative',
        height: '380px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
      }}>
        {(cat.imageUrl || cat.productImage) && !imgError ? (
          <>
            <div style={{
              position: 'absolute',
              inset: '0px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: hovered ? 'scale(1.1) translateY(-6px)' : 'scale(1) translateY(0)',
              transition: 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)',
            }}>
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
            {/* Subtle depth shadow under the image */}
            <div style={{
              position: 'absolute',
              bottom: '15px',
              left: '15%',
              right: '15%',
              height: '16px',
              background: 'radial-gradient(ellipse, rgba(8, 145, 178, 0.22) 0%, transparent 70%)',
              filter: 'blur(7px)',
              pointerEvents: 'none',
              transform: hovered ? 'scale(0.9) translateY(4px)' : 'scale(1) translateY(0)',
              transition: 'transform 0.5s ease',
            }} />
          </>
        ) : (
          /* Fallback gradient placeholder */
          <div style={{
            width: '100%',
            height: '100%',
            background: `linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #0891B2 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '18px',
          }}>
            <span style={{ fontSize: '4rem', opacity: 0.3, color: '#ffffff' }}>⊕</span>
          </div>
        )}
      </div>

      {/* ── Liquid Glass overlay band at bottom ── */}
      <div style={{
        height: '135px',
        padding: '20px 24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: hovered
          ? 'linear-gradient(135deg, rgba(10, 141, 147, 0.92) 0%, rgba(8, 109, 113, 0.8) 100%)'
          : 'linear-gradient(135deg, rgba(10, 141, 147, 0.78) 0%, rgba(8, 109, 113, 0.55) 100%)',
        borderRadius: '18px',
        marginTop: '16px',
        backdropFilter: 'blur(20px) saturate(2)',
        WebkitBackdropFilter: 'blur(20px) saturate(2)',
        border: '1px solid rgba(255, 255, 255, 0.35)',
        boxShadow: hovered
          ? 'inset 0 1px 1px rgba(255, 255, 255, 0.45), inset 0 10px 20px rgba(255, 255, 255, 0.15), 0 12px 36px rgba(10, 141, 147, 0.25)'
          : 'inset 0 1px 1px rgba(255, 255, 255, 0.35), inset 0 10px 20px rgba(255, 255, 255, 0.08), 0 8px 24px rgba(10, 141, 147, 0.15)',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Category name — large bold white */}
        <h2 style={{
          fontSize: '1.45rem',
          fontWeight: 800,
          color: '#ffffff',
          lineHeight: 1.15,
          margin: 0,
          letterSpacing: '-0.02em',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {cat.name}
        </h2>

        {/* EXPLORE → */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: hovered ? '12px' : '8px',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '2.5px',
          color: 'rgba(255,255,255,0.9)',
          textTransform: 'uppercase',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <span>Explore</span>
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
