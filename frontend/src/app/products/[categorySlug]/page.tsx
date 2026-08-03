import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import ProductInfiniteGrid from '@/components/ProductInfiniteGrid';
import CategoryNavigation from '@/components/CategoryNavigation';
import styles from '../products.module.css';

interface Props {
  params: Promise<{ categorySlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;

  try {
    const res = await fetch(`http://127.0.0.1:5000/api/public/categories/${categorySlug}`);
    const data = await res.json();

    if (res.ok && data.success) {
      return {
        title: `${data.data.name} | Medico Valley`,
        description: data.data.description,
        keywords: [data.data.name.toLowerCase(), 'medical education', 'clinical training models'],
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
}

async function getCategoryProducts(categorySlug: string) {
  try {
    const res = await fetch(`http://127.0.0.1:5000/api/public/categories/${categorySlug}/products?page=1&limit=12`, {
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
    const res = await fetch('http://127.0.0.1:5000/api/public/categories', {
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

export default async function CategoryProductsPage({ params }: Props) {
  const { categorySlug } = await params;
  const [result, categories] = await Promise.all([
    getCategoryProducts(categorySlug),
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

  const { category, data: products } = result;
  const activeCategory = categories.find((item: CategoryItem) => item.slug === category.slug);
  const heroImage =
    activeCategory?.imageUrl ||
    products.find((prod: ProductItem) => prod.mediaUrls?.[0] && !prod.mediaUrls[0].endsWith('.mp4'))?.mediaUrls?.[0] ||
    '';

  return (
    <div className={`${styles.categoryPage} animate-fade-in`}>
      <CategoryNavigation
        categories={categories}
        activeSlug={category.slug}
        backLinkHref="/products"
        backLinkText="Back"
      />

      <section className={styles.categoryHero}>
        {/* Background photo wrapper with blur filter & dark overlay */}
        <div className={styles.categoryHeroBgWrapper}>
          {heroImage ? (
            <Image
              src={heroImage}
              alt={category.name}
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
          {/* Breadcrumb: Home / Products / [Category Name] */}
          <div className={styles.categoryBreadcrumb}>
            <Link href="/">Home</Link>
            <span className={styles.breadcrumbSeparator}>/</span>
            <Link href="/products">Products</Link>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbCurrent}>{category.name}</span>
          </div>

          {/* Category Title: Last word in teal, small accent underline below */}
          <h1 className={styles.categoryHeroTitle}>
            {category.name}
          </h1>
          <div className={styles.categoryHeroTitleRule} />

          {/* Category Description */}
          {category.description && (
            <p className={styles.categoryHeroSubtitle}>
              {category.description}
            </p>
          )}
        </div>
      </section>

      <div className={styles.categoryContentWrapper}>
        {products.length > 0 ? (
          <ProductInfiniteGrid
            categorySlug={categorySlug}
            initialProducts={products}
            initialHasMore={Boolean(result.pagination?.hasMore)}
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
