import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import ProductMediaGallery from '@/components/ProductMediaGallery';
import ProductRatingWidget from '@/components/ProductRatingWidget';
import ProductDetailsTabs from '@/components/ProductDetailsTabs';
import ProductActionButtons from '@/components/ProductActionButtons';
import styles from '../../products.module.css';

interface Props {
  params: Promise<{ categorySlug: string; productSlug: string }>;
}

// 1. Dynamic SEO Metadata Generator
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productSlug, categorySlug } = await params;

  try {
    const res = await fetch(`http://127.0.0.1:5000/api/public/products/${productSlug}`);
    const data = await res.json();

    if (res.ok && data.success) {
      const product = data.data;
      const title = `${product.name} | Medico Valley`;
      const description = product.description.substring(0, 160);
      const keywords = [
        product.name.toLowerCase(),
        product.category?.name?.toLowerCase() || '',
        'medical model specifications',
      ];

      // Absolute URL configuration for dynamic meta sharing previews
      const mainImage = product.mediaUrls?.[0] || '';
      const absoluteImageUrl = mainImage.startsWith('http')
        ? mainImage
        : `http://localhost:3000${mainImage}`;
      
      const absoluteProductUrl = `http://localhost:3000/products/${categorySlug}/${productSlug}`;

      return {
        title,
        description,
        keywords,
        alternates: {
          canonical: absoluteProductUrl,
        },
        openGraph: {
          title,
          description,
          url: absoluteProductUrl,
          type: 'website',
          images: [
            {
              url: absoluteImageUrl,
              width: 1200,
              height: 630,
              alt: product.name,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [absoluteImageUrl],
        },
      };
    }
  } catch (err) {
    console.error('Error generating product metadata:', err);
  }

  return {
    title: 'Product Details | Medico Valley',
  };
}

// 2. Fetch specific product detail
async function getProductDetail(productSlug: string) {
  try {
    const res = await fetch(`http://127.0.0.1:5000/api/public/products/${productSlug}`, {
      cache: 'no-store',
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

interface RelatedProduct {
  _id: string;
  name: string;
  slug: string;
  mediaUrls: string[];
}

async function getRelatedProducts(categorySlug: string, productSlug: string): Promise<RelatedProduct[]> {
  try {
    const res = await fetch(
      `http://127.0.0.1:5000/api/public/categories/${categorySlug}/products?page=1&limit=8`,
      { cache: 'no-store' }
    );

    if (!res.ok) return [];

    const result = await res.json();
    return result.success
      ? result.data.filter((item: RelatedProduct) => item.slug !== productSlug).slice(0, 4)
      : [];
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { categorySlug, productSlug } = await params;
  const [result, relatedProducts] = await Promise.all([
    getProductDetail(productSlug),
    getRelatedProducts(categorySlug, productSlug),
  ]);

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
    <div className={`${styles.productDetailPage} animate-fade-in`}>
      <div className={styles.productDetailShell}>
        <Link href={`/products/${categorySlug}`} className={styles.productBreadcrumb}>
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          <span>Back to {product.category?.name} List</span>
        </Link>

        <div className={styles.detailGrid}>
          <ProductMediaGallery mediaUrls={product.mediaUrls} productName={product.name} />

          <aside className={styles.infoSection}>
            <div className={styles.productHeadingBlock}>
              <span className={styles.categoryTag}>{product.category?.name}</span>
              <h1 className={styles.productTitle}>{product.name}</h1>
            </div>

            <ProductRatingWidget 
              productId={product._id} 
              productSlug={productSlug} 
              categorySlug={categorySlug} 
            />

            <div className={styles.divider} style={{ margin: '16px 0 8px 0' }} />

            <ProductActionButtons
              productId={product._id}
              productName={product.name}
              productSlug={productSlug}
              categoryName={product.category?.name || ''}
              catalogUrl={product.catalogUrl}
            />
          </aside>
        </div>

        <ProductDetailsTabs 
          description={product.description} 
          productName={product.name} 
          categoryName={product.category?.name}
        />

        {relatedProducts.length > 0 && (
          <section className={styles.relatedSection} aria-labelledby="related-products-title">
            <div className={styles.relatedHeading}>
              <div>
                <span>Explore More</span>
                <h2 id="related-products-title">Related {product.category?.name}</h2>
              </div>
              <Link href={`/products/${categorySlug}`}>
                View All
                <span aria-hidden="true">-&gt;</span>
              </Link>
            </div>

            <div className={styles.relatedGrid}>
              {relatedProducts.map((relatedProduct) => {
                const firstMedia = relatedProduct.mediaUrls?.[0];
                const hasImage = firstMedia && !firstMedia.toLowerCase().endsWith('.mp4');

                return (
                  <Link
                    key={relatedProduct._id}
                    href={`/products/${categorySlug}/${relatedProduct.slug}`}
                    className={styles.relatedCard}
                  >
                    <div className={styles.relatedImageBox}>
                      {hasImage ? (
                        <Image
                          src={firstMedia}
                          alt={relatedProduct.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 25vw"
                        />
                      ) : (
                        <span>No Image Available</span>
                      )}
                    </div>
                    <div className={styles.relatedCardTitle}>
                      <h3>{relatedProduct.name}</h3>
                      <span aria-hidden="true">-&gt;</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
