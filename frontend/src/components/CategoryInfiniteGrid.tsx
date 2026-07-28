'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBackendUrl } from '@/utils/api';
import CategoryCard from './CategoryCard';

interface Category {
  _id: string;
  name: string;
  slug: string;
  imageUrl: string;
}

interface CardData extends Category {
  productImage: string;
}

interface Props {
  initialCategories: CardData[];
  initialHasMore: boolean;
  pageSize: number;
}

export default function CategoryInfiniteGrid({
  initialCategories,
  initialHasMore,
  pageSize,
}: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Sync state with props when Server Components refresh/revalidate
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  useEffect(() => {
    setHasMore(initialHasMore);
  }, [initialHasMore]);



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
            getBackendUrl(`http://localhost:5000/api/public/categories?page=${nextPage}&limit=${pageSize}`)
          );
          const result = await res.json();

          if (res.ok && result.success) {
            setCategories((current) => [...current, ...result.data]);
            setPage(nextPage);
            setHasMore(Boolean(result.pagination?.hasMore));
          }
        } catch (error) {
          console.error('Error loading more categories:', error);
        } finally {
          setLoading(false);
        }
      },
      { rootMargin: '240px 0px' }
    );

    observer.observe(loader);

    return () => observer.disconnect();
  }, [hasMore, loading, page, pageSize]);

  return (
    <>
      <main className="productsDirectoryGrid" style={{
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '0 40px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '28px',
      }}>
        {categories.map((cat, idx) => (
          <CategoryCard key={cat._id} cat={cat} index={idx} />
        ))}
      </main>

      <div 
        ref={loaderRef} 
        style={{
          textAlign: 'center',
          padding: '40px 0 80px',
          color: '#64748B',
          fontSize: '0.9rem',
          fontWeight: 500,
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div className="categorySpinner" style={{
              width: '24px',
              height: '24px',
              border: '3px solid rgba(8, 145, 178, 0.1)',
              borderTopColor: '#0891B2',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            <span>Loading more categories...</span>
          </div>
        ) : hasMore ? (
          ''
        ) : categories.length > pageSize ? (
          'All categories loaded'
        ) : (
          ''
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
