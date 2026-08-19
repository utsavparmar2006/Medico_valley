'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBackendUrl } from '@/utils/api';
import Image from 'next/image';
import Link from 'next/link';
import styles from '@/app/products/products.module.css';

interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  mediaUrls: string[];
}

interface SubcategoryItem {
  _id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  productCount?: number;
}

interface Props {
  categorySlug: string;
  initialProducts: ProductItem[];
  initialHasMore: boolean;
  subcategories?: SubcategoryItem[];
  initialSub?: string;
}

const PAGE_SIZE = 12;

interface ProductCardProps {
  prod: ProductItem;
  categorySlug: string;
}

function ProductCardItem({ prod, categorySlug }: ProductCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLAnchorElement | null>(null);

  // Clear hover on outside touch
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

  const handleClick = (e: React.MouseEvent) => {
    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    if (isTouch && !isHovered) {
      e.preventDefault();
      setIsHovered(true);
    }
  };

  return (
    <Link
      ref={cardRef}
      key={prod._id}
      href={`/products/${categorySlug}/${prod.slug}`}
      className={`${styles.productImageCard} ${isHovered ? styles.touchActive : ''}`}
      onClick={handleClick}
    >
      <div className={styles.productImageOnlyBox}>
        {prod.mediaUrls.length > 0 ? (
          prod.mediaUrls[0].endsWith('.mp4') ? (
            <div className={styles.productVideoPreview}>
              <span>Video Preview</span>
            </div>
          ) : (
            <Image
              src={prod.mediaUrls[0]}
              alt={prod.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 900px) 50vw, 25vw"
              className={styles.productImageOnly}
            />
          )
        ) : (
          <div className={styles.productImagePlaceholder}>
            <span>No Image Available</span>
          </div>
        )}
      </div>
      <div className={styles.productNameBar}>
        <h3>{prod.name}</h3>
        <span aria-hidden="true">-&gt;</span>
      </div>
    </Link>
  );
}

export default function ProductInfiniteGrid({
  categorySlug,
  initialProducts,
  initialHasMore,
  subcategories = [],
  initialSub = 'all',
}: Props) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [activeSub, setActiveSub] = useState<string>(initialSub || 'all');
  const [subLoading, setSubLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Sync state with props when Server Components refresh/revalidate
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    setHasMore(initialHasMore);
  }, [initialHasMore]);

  useEffect(() => {
    if (initialSub) {
      setActiveSub(initialSub);
    }
  }, [initialSub]);

  const handleSubChange = (slug: string) => {
    if (slug === activeSub) return;
    const nextUrl = slug === 'all'
      ? `/products/${categorySlug}`
      : `/products/${categorySlug}?sub=${slug}`;
    router.push(nextUrl);
  };

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader || !hasMore) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || loading) return;

        setLoading(true);
        const nextPage = page + 1;

        try {
          const url = activeSub === 'all'
            ? `http://localhost:5000/api/public/categories/${categorySlug}/products?page=${nextPage}&limit=${PAGE_SIZE}`
            : `http://localhost:5000/api/public/categories/${categorySlug}/products?page=${nextPage}&limit=${PAGE_SIZE}&sub=${activeSub}`;

          const res = await fetch(getBackendUrl(url));
          const result = await res.json();

          if (res.ok && result.success) {
            setProducts((current) => [...current, ...result.data]);
            setPage(nextPage);
            setHasMore(Boolean(result.pagination?.hasMore));
          }
        } catch (error) {
          console.error('Error loading more products:', error);
        } finally {
          setLoading(false);
        }
      },
      { rootMargin: '240px 0px' }
    );

    observer.observe(loader);

    return () => observer.disconnect();
  }, [categorySlug, activeSub, hasMore, loading, page]);

  const activeSubObj = subcategories.find((s) => s.slug === activeSub);

  return (
    <>
      {/* SUBCATEGORIES CARDS GRID VIEW (When activeSub === 'all') */}
      {activeSub === 'all' && subcategories.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <div className={`${styles.grid} ${styles.categoryProductGrid}`}>
            {subcategories.map((sub) => (
              <Link
                key={sub._id}
                href={`/products/${categorySlug}?sub=${sub.slug}`}
                className={styles.productImageCard}
              >
                <div className={styles.productImageOnlyBox}>
                  {sub.imageUrl ? (
                    <Image
                      src={sub.imageUrl}
                      alt={sub.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 900px) 50vw, 25vw"
                      className={styles.productImageOnly}
                    />
                  ) : (
                    <div className={styles.productImagePlaceholder}>
                      <span>{sub.name}</span>
                    </div>
                  )}
                </div>
                <div className={styles.productNameBar}>
                  <div>
                    <h3>{sub.name}</h3>
                    {typeof sub.productCount === 'number' && (
                      <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 'normal' }}>
                        {sub.productCount} {sub.productCount === 1 ? 'Product' : 'Products'}
                      </span>
                    )}
                  </div>
                  <span aria-hidden="true">-&gt;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* PRODUCTS GRID VIEW (Only when a subcategory is selected OR if no subcategories exist) */}
      {(activeSub !== 'all' || subcategories.length === 0) && (
        <>
          {activeSub !== 'all' && (
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
                  {activeSubObj ? activeSubObj.name : 'Products'}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '2px' }}>
                  Showing all products in {activeSubObj ? activeSubObj.name : 'subcategory'}
                </p>
              </div>
              <Link
                href={`/products/${categorySlug}`}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              >
                ← View All Subcategories
              </Link>
            </div>
          )}

          {subLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              Loading products...
            </div>
          ) : products.length > 0 ? (
            <>
              <div className={`${styles.grid} ${styles.categoryProductGrid}`}>
                {products.map((prod) => (
                  <ProductCardItem key={prod._id} prod={prod} categorySlug={categorySlug} />
                ))}
              </div>

              <div ref={loaderRef} className={styles.productGridLoader}>
                {loading ? 'Loading more products...' : ''}
              </div>
            </>
          ) : (
            <div className={styles.emptyState} style={{ padding: '40px 0' }}>
              <h3>No Products Found</h3>
              <p>There are no products listed under this subcategory yet.</p>
            </div>
          )}
        </>
      )}
    </>
  );
}
