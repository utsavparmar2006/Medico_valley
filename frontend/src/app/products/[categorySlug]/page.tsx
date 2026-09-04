import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import ProductInfiniteGrid from '@/components/ProductInfiniteGrid';
import CategoryNavigation from '@/components/CategoryNavigation';
import styles from '../products.module.css';

interface Props {
  params: Promise<{ categorySlug: string }>;
  searchParams?: Promise<{ sub?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const { sub } = (await (searchParams || {})) || {};

  try {
    const res = await fetch(`http://127.0.0.1:5001/api/public/categories/${categorySlug}`);
    const data = await res.json();

    if (res.ok && data.success) {
      const category = data.data;

      // If a subcategory filter is requested, fetch subcategories to generate targeted SEO metadata
      if (sub) {
        const prodRes = await fetch(`http://127.0.0.1:5001/api/public/categories/${categorySlug}/products?page=1&limit=1&sub=${sub}`).catch(() => null);
        const prodData = prodRes && prodRes.ok ? await prodRes.json().catch(() => null) : null;
        const matchingSub = prodData?.subcategories?.find((s: any) => s.slug === sub);

        const subName = matchingSub?.name || sub.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const subDesc = matchingSub?.description || `Explore ${subName} in our ${category.name} range. Precision medical models and simulators for clinical training.`;

        const title = `${subName} - ${category.name} | Medico Valley`;
        const canonicalUrl = `http://localhost:3000/products/${categorySlug}?sub=${sub}`;

        return {
          title,
          description: subDesc,
          keywords: [
            subName.toLowerCase(),
            category.name.toLowerCase(),
            'medical models India',
            'clinical training simulators',
            'medical education equipment',
          ],
          alternates: {
            canonical: canonicalUrl,
          },
          openGraph: {
            title,
            description: subDesc,
            url: canonicalUrl,
            type: 'website',
          },
        };
      }

      const title = `${category.name} | Medico Valley`;
      const canonicalUrl = `http://localhost:3000/products/${categorySlug}`;

      return {
        title,
        description: category.description,
        keywords: [
          category.name.toLowerCase(),
          'medical education',
          'clinical training models',
          'medical simulation India',
        ],
        alternates: {
          canonical: canonicalUrl,
        },
        openGraph: {
          title,
          description: category.description,
          url: canonicalUrl,
          type: 'website',
        },
      };
    }
  } catch (err) {
    console.error('Error generating metadata:', err);
  }

  return {
    title: 'Category Portfolio | Medico Valley',
  };
}

interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  mediaUrls: string[];
}

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  heroBannerUrl?: string;
}

interface SubcategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  heroBannerUrl?: string;
  productCount?: number;
}

async function getCategoryProducts(categorySlug: string, subSlug?: string) {
  try {
    const url = subSlug
      ? `http://127.0.0.1:5001/api/public/categories/${categorySlug}/products?page=1&limit=12&sub=${subSlug}`
      : `http://127.0.0.1:5001/api/public/categories/${categorySlug}/products?page=1&limit=12`;

    const res = await fetch(url, {
      cache: 'no-store',
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

async function getCategories() {
  try {
    const res = await fetch('http://127.0.0.1:5001/api/public/categories', {
      cache: 'no-store',
    });

    if (!res.ok) {
      return [];
    }

    const result = await res.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function CategoryProductsPage({ params, searchParams }: Props) {
  const { categorySlug } = await params;
  const { sub } = (await (searchParams || {})) || {};

  const [result, categories] = await Promise.all([
    getCategoryProducts(categorySlug, sub),
    getCategories(),
  ]);

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

  const { category, data: products, subcategories = [] } = result;
  const activeCategory = categories.find((item: CategoryItem) => item.slug === category.slug);

  // Active subcategory resolution
  const activeSubObj: SubcategoryItem | undefined = sub
    ? subcategories.find((s: SubcategoryItem) => s.slug === sub)
    : undefined;

  const displayTitle = activeSubObj ? activeSubObj.name : category.name;
  const displaySubtitle = activeSubObj?.description || category.description;

  const heroImage =
    activeSubObj?.heroBannerUrl ||
    activeSubObj?.imageUrl ||
    activeCategory?.heroBannerUrl ||
    activeCategory?.imageUrl ||
    products.find((prod: ProductItem) => prod.mediaUrls?.[0] && !prod.mediaUrls[0].endsWith('.mp4'))?.mediaUrls?.[0] ||
    '';

  // Google SEO BreadcrumbList JSON-LD Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'http://localhost:3000',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: 'http://localhost:3000/products',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: `http://localhost:3000/products/${categorySlug}`,
      },
      ...(activeSubObj
        ? [
            {
              '@type': 'ListItem',
              position: 4,
              name: activeSubObj.name,
              item: `http://localhost:3000/products/${categorySlug}?sub=${activeSubObj.slug}`,
            },
          ]
        : []),
    ],
  };

  return (
    <div className={`${styles.categoryPage} animate-fade-in`}>
      {/* Google SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <CategoryNavigation
        categories={categories}
        activeSlug={category.slug}
        showBackLink={false}
      />

      <section className={styles.categoryHero}>
        {/* Background photo wrapper with blur filter & dark overlay */}
        <div className={styles.categoryHeroBgWrapper}>
          {heroImage ? (
            <Image
              src={heroImage}
              alt={displayTitle}
              fill
              priority
              sizes="100vw"
              className={styles.categoryHeroImage}
            />
          ) : (
            <div className={styles.categoryHeroFallback} />
          )}
          <div className={styles.categoryHeroOverlay} />
        </div>

        <div className={styles.categoryHeroContent}>
          {/* Dynamic Breadcrumb with Subcategory Support */}
          <div className={styles.categoryBreadcrumb}>
            <Link href="/">Home</Link>
            <span className={styles.breadcrumbSeparator}>/</span>
            <Link href="/products">Products</Link>
            <span className={styles.breadcrumbSeparator}>/</span>
            {activeSubObj ? (
              <>
                <Link href={`/products/${categorySlug}`}>{category.name}</Link>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span className={styles.breadcrumbCurrent}>{activeSubObj.name}</span>
              </>
            ) : (
              <span className={styles.breadcrumbCurrent}>{category.name}</span>
            )}
          </div>

          {/* Dynamic Category / Subcategory Title */}
          <h1 className={styles.categoryHeroTitle}>
            {displayTitle}
          </h1>
          <div className={styles.categoryHeroTitleRule} />

          {/* Dynamic Description */}
          {displaySubtitle && (
            <p className={styles.categoryHeroSubtitle}>
              {displaySubtitle}
            </p>
          )}

          {/* Dedicated Responsive Banner for Mobile/Tablet to prevent panoramic image cropping */}
          {heroImage && (
            <div className={styles.categoryHeroBannerMobileCard}>
              <Image
                src={heroImage}
                alt={displayTitle}
                width={768}
                height={230}
                priority
                className={styles.categoryHeroBannerMobileImg}
              />
            </div>
          )}
        </div>
      </section>

      <div className={styles.categoryContentWrapper}>
        {products.length > 0 || subcategories.length > 0 ? (
          <ProductInfiniteGrid
            categorySlug={categorySlug}
            initialProducts={products}
            initialHasMore={Boolean(result.pagination?.hasMore)}
            subcategories={subcategories}
            initialSub={sub || 'all'}
          />
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
    </div>
  );
}
