import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import styles from './products.module.css';

export const metadata: Metadata = {
  title: 'Products Directory | Delta Healthcare',
  description: 'Browse Delta Healthcare\'s professional range of anatomy models, clinical simulators, and task trainers. High-fidelity medical solutions tailored for healthcare institutions.',
  keywords: ['anatomy models', 'medical simulators', 'clinical task trainers', 'medical equipment India'],
};

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
}

// Fetch categories on server side (dynamic caching)
async function getCategories() {
  try {
    const res = await fetch('http://localhost:5000/api/public/categories', {
      next: { revalidate: 60 }, // revalidate every 60 seconds
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function ProductsCategoriesPage() {
  const categories: CategoryItem[] = await getCategories();

  return (
    <div className={`${styles.container} animate-fade-in`}>
      <div className={styles.titleBlock}>
        <h1>Medical Solutions Portfolio</h1>
        <p>Select a medical specialty to browse our catalog of high-fidelity simulators, task trainers, and anatomy models.</p>
      </div>

      {categories.length > 0 ? (
        <div className={styles.grid}>
          {categories.map((cat) => (
            <div key={cat._id} className={styles.card}>
              <div className={styles.imageBox}>
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className={styles.content}>
                <h3 className={styles.cardTitle}>{cat.name}</h3>
                <p className={styles.cardDesc}>{cat.description}</p>
                <Link href={`/products/${cat.slug}`} className={styles.actionBtn}>
                  <span>Explore Products</span>
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
          <p>No product categories found. Please seed the database or check back later.</p>
        </div>
      )}
    </div>
  );
}
