import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import ProductMediaGallery from '@/components/ProductMediaGallery';
import ProductDetailsTabs from '@/components/ProductDetailsTabs';
import ProductActionButtons from '@/components/ProductActionButtons';
import ProductRatingWidget from '@/components/ProductRatingWidget';
import YouTubePlayer from '@/components/YouTubePlayer';
import { getYouTubeEmbedUrl } from '@/utils/youtube';
import styles from '../../products.module.css';

interface Props {
  params: Promise<{ categorySlug: string; productSlug: string }>;
}

// 1. Dynamic SEO Metadata Generator
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productSlug, categorySlug } = await params;

  try {
    const res = await fetch(`http://127.0.0.1:5001/api/public/products/${productSlug}`);
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
    const res = await fetch(`http://127.0.0.1:5001/api/public/products/${productSlug}`, {
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

async function getRelatedProducts(categorySlug: string, productSlug: string, subcategorySlug?: string): Promise<RelatedProduct[]> {
  try {
    let subProducts: RelatedProduct[] = [];

    // Fetch products matching subcategory if subcategory is present
    if (subcategorySlug) {
      const subRes = await fetch(
        `http://127.0.0.1:5001/api/public/categories/${categorySlug}/products?page=1&limit=12&sub=${subcategorySlug}`,
        { cache: 'no-store' }
      );
      if (subRes.ok) {
        const subData = await subRes.json();
        if (subData.success && Array.isArray(subData.data)) {
          subProducts = subData.data.filter((item: RelatedProduct) => item.slug !== productSlug);
        }
      }
    }

    if (subProducts.length >= 4) {
      return subProducts.slice(0, 4);
    }

    // Fallback/Supplement with parent category products
    const res = await fetch(
      `http://127.0.0.1:5001/api/public/categories/${categorySlug}/products?page=1&limit=12`,
      { cache: 'no-store' }
    );

    if (res.ok) {
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        const catProducts = result.data.filter(
          (item: RelatedProduct) => item.slug !== productSlug && !subProducts.some((sf) => sf._id === item._id)
        );
        return [...subProducts, ...catProducts].slice(0, 4);
      }
    }

    return subProducts.slice(0, 4);
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
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
  const relatedProducts = await getRelatedProducts(categorySlug, productSlug, product.subcategory?.slug);
  const ytEmbedUrl = getYouTubeEmbedUrl(product.youtubeUrl);

  return (
    <div className={`${styles.productDetailPage} animate-fade-in`}>
      <div className={styles.productDetailShell}>
        <Link
          href={product.subcategory?.slug ? `/products/${categorySlug}?sub=${product.subcategory.slug}` : `/products/${categorySlug}`}
          className={styles.productBreadcrumb}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          <span>Back to {product.subcategory?.name || product.category?.name} List</span>
        </Link>

        <div className={styles.detailGrid}>
          <ProductMediaGallery
            mediaUrls={product.mediaUrls}
            productName={product.name}
          />

          <aside className={styles.infoSection}>
            <div className={styles.productHeadingBlock}>
              <span className={styles.categoryTag}>
                {product.category?.name} {product.subcategory?.name ? `• ${product.subcategory.name}` : ''}
              </span>
              <h1 className={styles.productTitle}>{product.name}</h1>
            </div>

            {product.showRating !== false && (
              <>
                <ProductRatingWidget
                  productId={product._id}
                  productSlug={productSlug}
                  categorySlug={categorySlug}
                />
                <div className={styles.divider} style={{ margin: '12px 0 8px 0' }} />
              </>
            )}

            <ProductActionButtons
              productId={product._id}
              productName={product.name}
              productSlug={productSlug}
              categoryName={product.category?.name || ''}
              catalogUrl={product.catalogUrl}
              ctaText={product.ctaText}
            />
          </aside>
        </div>

        <ProductDetailsTabs 
          description={product.description} 
          productName={product.name} 
          categoryName={product.category?.name}
          keyFeatures={product.keyFeatures}
        />

        {/* ── Dedicated YouTube Video Demonstration Section ── */}
        {ytEmbedUrl && (
          <section
            aria-labelledby="product-video-heading"
            style={{
              marginTop: '56px',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '36px',
              width: '100%',
              fontFamily: 'var(--font-sans), system-ui, -apple-system, sans-serif',
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: '#ef4444',
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                padding: '4px 12px',
                borderRadius: '999px',
                marginBottom: '8px',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Video Demonstration
              </span>
              <h2 id="product-video-heading" style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: '4px 0 0 0',
                lineHeight: 1.3,
              }}>
                Watch {product.name} in Action
              </h2>
              <p style={{
                fontSize: '0.88rem',
                color: '#64748b',
                margin: '6px 0 0 0',
              }}>
                Explore comprehensive features, real-world clinical application, and training workflow.
              </p>
            </div>

            <YouTubePlayer
              youtubeUrl={product.youtubeUrl}
              title={`${product.name} Video Demonstration`}
            />
          </section>
        )}

        {relatedProducts.length > 0 && (
          <section className={styles.relatedSection} aria-labelledby="related-products-title">
            <div className={styles.relatedHeading}>
              <div>
                <span>Explore More</span>
                <h2 id="related-products-title">
                  Related {product.subcategory?.name || product.category?.name}
                </h2>
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
