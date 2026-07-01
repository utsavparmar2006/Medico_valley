import React from 'react';
import Link from 'next/link';
import CategoryInfiniteGrid from '@/components/CategoryInfiniteGrid';

interface Category {
  _id: string;
  name: string;
  slug: string;
  imageUrl: string;
  productImage?: string;
}

interface CardData extends Category {
  productImage: string;
}

const PAGE_SIZE = 6;

async function getAllCategories(): Promise<Category[]> {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/public/categories', {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching all categories for products directory:', error);
    return [];
  }
}

async function getPaginatedCategories(page: number, limit: number) {
  try {
    const res = await fetch(`http://127.0.0.1:5000/api/public/categories?page=${page}&limit=${limit}`, {
      cache: 'no-store'
    });
    if (!res.ok) return { data: [], hasMore: false };
    const data = await res.json();
    return {
      data: data.success ? data.data : [],
      hasMore: data.success ? Boolean(data.pagination?.hasMore) : false
    };
  } catch (error) {
    console.error('Error fetching paginated categories:', error);
    return { data: [], hasMore: false };
  }
}

export default async function ProductsPage() {
  const [allCategories, paginatedResult] = await Promise.all([
    getAllCategories(),
    getPaginatedCategories(1, PAGE_SIZE)
  ]);

  // Map category data to format expected by the cards
  const initialCards: CardData[] = paginatedResult.data.map((cat: Category) => ({
    ...cat,
    productImage: cat.productImage || cat.imageUrl || ''
  }));

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingTop: '80px' }}>

      {/* Header */}
      <header className="productsDirectoryHeader" style={{
        width: '100%',
        padding: '28px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'transparent',
      }}>
        <Link href="/" className="productsHomeLink" style={{
          fontWeight: 800,
          fontSize: '1rem',
          color: '#0F172A',
          textDecoration: 'none',
          letterSpacing: '-0.01em',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0891B2" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Home
        </Link>

        {/* Category nav tabs */}
        <nav className="productsCategoryNav" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          {allCategories.map((cat) => (
            <Link
              key={cat._id}
              href={`/products/${cat.slug}`}
              style={{
                fontSize: '0.85rem',
                color: '#64748B',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </header>

      {/* Cards Grid with Infinite Scroll */}
      <CategoryInfiniteGrid
        initialCategories={initialCards}
        initialHasMore={paginatedResult.hasMore}
        pageSize={PAGE_SIZE}
      />

      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 900px) {
          .productsDirectoryGrid {
            grid-template-columns: 1fr !important;
            padding: 0 20px 60px !important;
          }

          .productsDirectoryHeader {
            align-items: flex-start !important;
            flex-direction: column !important;
            gap: 18px !important;
            padding: 18px 20px 22px !important;
          }

          .productsHomeLink {
            max-width: 100%;
            line-height: 1.25;
          }

          .productsCategoryNav {
            width: calc(100vw - 40px);
            max-width: 100%;
            gap: 18px !important;
            overflow-x: auto;
            overflow-y: hidden;
            padding: 2px 0 8px;
            scroll-snap-type: x proximity;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }

          .productsCategoryNav::-webkit-scrollbar {
            display: none;
          }

          .productsCategoryNav a {
            flex: 0 0 auto;
            scroll-snap-align: start;
            white-space: nowrap;
          }
        }

        @media (max-width: 420px) {
          .productsDirectoryHeader {
            padding-left: 18px !important;
            padding-right: 18px !important;
          }

          .productsCategoryNav {
            width: calc(100vw - 36px);
          }
        }
      `}</style>
    </div>
  );
}
