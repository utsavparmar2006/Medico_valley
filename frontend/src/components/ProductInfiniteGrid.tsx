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

interface Props {
  categorySlug: string;
  initialProducts: ProductItem[];
  initialHasMore: boolean;
}

const PAGE_SIZE = 12;

export default function ProductInfiniteGrid({
  categorySlug,
  initialProducts,
  initialHasMore,
}: Props) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Sync state with props when Server Components refresh/revalidate
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    setHasMore(initialHasMore);
  }, [initialHasMore]);

  // Automatically refresh/sync data from the server on window focus or at short intervals
  useEffect(() => {
    const handleFocus = () => {
      router.refresh();
    };
    window.addEventListener('focus', handleFocus);

    const interval = setInterval(() => {
      router.refresh();
    }, 15000); // Check for updates every 15 seconds

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [router]);

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader || !hasMore) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || loading) return;

        setLoading(true);
        const nextPage = page + 1;

        try {
          const res = await fetch(
            getBackendUrl(`http://localhost:5000/api/public/categories/${categorySlug}/products?page=${nextPage}&limit=${PAGE_SIZE}`)
          );
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
  }, [categorySlug, hasMore, loading, page]);

  return (
    <>
      <div className={`${styles.grid} ${styles.categoryProductGrid}`}>
        {products.map((prod) => (
          <Link
            key={prod._id}
            href={`/products/${categorySlug}/${prod.slug}`}
            className={styles.productImageCard}
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
        ))}
      </div>

      <div ref={loaderRef} className={styles.productGridLoader}>
        {loading ? 'Loading more products...' : hasMore ? '' : products.length > PAGE_SIZE ? 'All products loaded' : ''}
      </div>
    </>
  );
}
