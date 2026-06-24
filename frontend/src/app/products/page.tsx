import React from 'react';
import Link from 'next/link';
import CategoryCard from '@/components/CategoryCard';

interface Category {
  _id: string;
  name: string;
  slug: string;
  imageUrl: string;
}

interface Product {
  _id: string;
  imageUrl?: string;
  images?: string[];
  mediaUrls?: string[];
  category?: { slug: string };
}

interface CardData extends Category {
  productImage: string;
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/public/categories', {
      next: { revalidate: 60 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching categories for products directory:', error);
    return [];
  }
}

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/public/products', {
      next: { revalidate: 60 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching products for products directory:', error);
    return [];
  }
}

export default async function ProductsPage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts()
  ]);

  const cards: CardData[] = categories.map((cat: Category) => {
    const catProducts = products.filter(
      (p: Product) => p.category?.slug === cat.slug
    );
    const firstProduct = catProducts[0];
    const productImage =
      firstProduct?.mediaUrls?.[0] ||
      firstProduct?.images?.[0] ||
      firstProduct?.imageUrl ||
      cat.imageUrl ||
      '';

    return { ...cat, productImage };
  });

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
          {cards.map((cat) => (
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

      {/* Cards Grid */}
      <main className="productsDirectoryGrid" style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 48px 80px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '28px',
      }}>
        {cards.map((cat, idx) => (
          <CategoryCard key={cat._id} cat={cat} index={idx} />
        ))}
      </main>

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
