import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import ProductMediaGallery from '@/components/ProductMediaGallery';
import styles from '../../products.module.css';

interface Props {
  params: Promise<{ categorySlug: string; productSlug: string }>;
}

// 1. Dynamic SEO Metadata Generator
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productSlug } = await params;

  try {
    const res = await fetch(`http://localhost:5000/api/public/products/${productSlug}`);
    const data = await res.json();
    
    if (res.ok && data.success) {
      return {
        title: `${data.data.name} | Delta Healthcare`,
        description: data.data.description.substring(0, 160), // standard meta description limit
        keywords: [data.data.name.toLowerCase(), data.data.category?.name.toLowerCase(), 'medical model specifications'],
      };
    }
  } catch (err) {
    console.error('Error generating product metadata:', err);
  }

  return {
    title: 'Product Details | Delta Healthcare',
  };
}

// 2. Fetch specific product detail
async function getProductDetail(productSlug: string) {
  try {
    const res = await fetch(`http://localhost:5000/api/public/products/${productSlug}`, {
      next: { revalidate: 60 },
    });
    
    if (!res.ok) {
      return null;
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching product detail:', error);
    return null;
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { categorySlug, productSlug } = await params;
  const result = await getProductDetail(productSlug);

  if (!result || !result.success) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h1>Product Not Found</h1>
          <p>We could not find the product matching the path: <strong>{productSlug}</strong>.</p>
          <Link href={`/products/${categorySlug}`} className="btn btn-secondary" style={{ marginTop: '24px' }}>
            Back to Category
          </Link>
        </div>
      </div>
    );
  }

  const product = result.data;

  return (
    <div className={`${styles.container} animate-fade-in`}>
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: '32px' }}>
        <Link href={`/products/${categorySlug}`} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontWeight: 600 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}>
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          Back to {product.category?.name} List
        </Link>
      </div>

      <div className={styles.detailGrid}>
        {/* Left Column: Interactive Client Gallery */}
        <ProductMediaGallery mediaUrls={product.mediaUrls} productName={product.name} />

        {/* Right Column: Detailed Metadata */}
        <div className={styles.infoSection}>
          <div>
            <span className={styles.categoryTag}>{product.category?.name}</span>
            <h1 className={styles.productTitle}>{product.name}</h1>
          </div>

          <div className={styles.divider} />

          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', fontWeight: 700 }}>Technical Details & Description</h3>
            <p className={styles.infoDesc}>{product.description}</p>
          </div>

          {product.catalogUrl && (
            <>
              <div className={styles.divider} />
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', fontWeight: 700 }}>Documents & Catalogs</h3>
                <a
                  href={product.catalogUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.catalogDownloadBtn}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 3v12"/>
                  </svg>
                  <span>Download Product Brochure (PDF)</span>
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
