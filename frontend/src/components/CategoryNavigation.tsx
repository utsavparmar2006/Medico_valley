'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from '@/app/products/products.module.css';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
}

interface Props {
  categories: CategoryItem[];
  activeSlug?: string;
  backLinkHref: string;
  backLinkText: string;
}

export default function CategoryNavigation({
  categories,
  activeSlug,
  backLinkHref,
  backLinkText,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Find active category name
  const activeCategory = categories.find((c) => c.slug === activeSlug);

  return (
    <header className={styles.categoryHeader}>
      {/* Desktop Header Navigation */}
      <div className={`${styles.categoryHeaderInner} ${styles.desktopCategoryHeader}`}>
        <Link href={backLinkHref} className={styles.categoryBackLink} aria-label={backLinkText}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>{backLinkText}</span>
        </Link>

        <nav className={styles.categoryTabs} aria-label="Product categories">
          {categories.map((item) => {
            const isActive = item.slug === activeSlug;
            return (
              <Link
                key={item._id}
                href={`/products/${item.slug}`}
                className={isActive ? styles.categoryTabActive : ''}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Integrated Pure White Header Bar matching Navbar */}
      <div className={styles.mobileCategoryBarWrap}>
        <div className={styles.mobileCategoryBarInner}>
          {/* Circular Back Button */}
          <Link href={backLinkHref} className={styles.mobileBackBtnCircle} aria-label={backLinkText}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>

          {/* Interactive Category Selector Pill */}
          <button
            type="button"
            className={styles.mobileCategoryDropdownToggle}
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
          >
            <div className={styles.mobileCategoryTextGroup}>
              <span className={styles.mobileCategoryLabelTag}>EXPLORE CATEGORY</span>
              <span className={styles.mobileCategoryCurrentName}>
                {activeCategory ? activeCategory.name : 'All Categories'}
              </span>
            </div>
            <div className={styles.mobileChevronBadge}>
              <svg
                className={`${styles.mobileChevronIcon} ${isOpen ? styles.chevronOpen : ''}`}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </button>
        </div>

        {/* Collapsible Dropdown Menu Card */}
        {isOpen && (
          <div className={styles.mobileCategoryDropdownMenu}>
            {categories.map((item) => {
              const isActive = item.slug === activeSlug;
              return (
                <Link
                  key={item._id}
                  href={`/products/${item.slug}`}
                  className={`${styles.mobileDropdownItem} ${
                    isActive ? styles.mobileDropdownItemActive : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span>{item.name}</span>
                  {isActive && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a8d93" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
