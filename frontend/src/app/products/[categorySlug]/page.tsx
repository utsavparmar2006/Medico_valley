import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import styles from '../products.module.css';

interface Props {
  params: Promise<{ categorySlug: string }>;
}

// 1. Dynamic SEO Metadata Generator
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;

  try {
    const res = await fetch(`http://localhost:5000/api/public/categories/${categorySlug}`);
    const data = await res.json();
    
    if (res.ok && data.success) {
      return {
        title: `${data.data.name} | Delta Healthcare`,
        description: data.data.description,
        keywords: [data.data.name.toLowerCase(), 'medical education', 'clinical training models'],
      };
    }
  } catch (err) {
    console.error('Error generating metadata:', err);
  }

  return {
    title: 'Category Portfolio | Delta Healthcare',
  };
}

interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  mediaUrls: string[];
}

// 2. Fetch products inside this category
async function getCategoryProducts(categorySlug: string) {
  try {
    const res = await fetch(`http://localhost:5000/api/public/categories/${categorySlug}/products`, {
      next: { revalidate: 60 },
    });
    
    if (!res.ok) {
      return null;
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching category products:', error);
    return null;
  }
}

export default async function CategoryProductsPage({ params }: Props) {
  const { categorySlug } = await params;
  const result = await getCategoryProducts(categorySlug);

  if (!result || !result.success) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h1>Category Not Found</h1>
          <p>We could not find the category matching the path: <strong>{categorySlug}</strong>.</p>
          <Link href="/products" className="btn btn-secondary" style={{ marginTop: '24px' }}>
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const { category, data: products } = result;

  return (
    <div className={`${styles.container} animate-fade-in`}>
      <div className={styles.titleBlock}>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Portfolio Range</span>
        <h1>{category.name}</h1>
        <p>{category.description}</p>
      </div>

      {products.length > 0 ? (
        <div className={styles.grid}>
          {products.map((prod: ProductItem) => (
            <div key={prod._id} className={styles.card}>
              <div className={styles.imageBox}>
                {prod.mediaUrls.length > 0 ? (
                  prod.mediaUrls[0].endsWith('.mp4') ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1f3a' }}>
                      <span style={{ color: 'white', fontWeight: 600 }}>🎬 Video Preview</span>
                    </div>
                  ) : (
                    <Image
                      src={prod.mediaUrls[0]}
                      alt={prod.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  )
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ddd' }}>
                    <span>No Image Available</span>
                  </div>
                )}
              </div>
              <div className={styles.content}>
                <h3 className={styles.cardTitle}>{prod.name}</h3>
                <p className={styles.cardDesc} style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {prod.description}
                </p>
                <Link href={`/products/${categorySlug}/${prod.slug}`} className={styles.actionBtn}>
                  <span>View Technical Details</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <h3>No Products Added Yet</h3>
          <p>There are currently no products listed under this category. Please check back later or contact support.</p>
          <Link href="/products" className="btn btn-secondary" style={{ marginTop: '24px' }}>
            Back to Directory
          </Link>
        </div>
      )}
    </div>
  );
}
