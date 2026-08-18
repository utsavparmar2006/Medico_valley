'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getBackendUrl } from '@/utils/api';
import styles from '@/app/products/products.module.css';

interface SubcategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
}

interface Props {
  categories: CategoryItem[];
  activeSlug?: string;
  backLinkHref?: string;
  backLinkText?: string;
  showBackLink?: boolean;
}

export default function CategoryNavigation({
  categories,
  activeSlug,
  backLinkHref,
  backLinkText = 'Back',
  showBackLink = true,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredCategorySlug, setHoveredCategorySlug] = useState<string | null>(null);
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<string, SubcategoryItem[]>>({});
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Find active category name
  const activeCategory = categories.find((c) => c.slug === activeSlug);
  const shouldShowBack = showBackLink && Boolean(backLinkHref);

  // Pre-fetch subcategories for all categories on mount for instant hover response
  useEffect(() => {
    if (!categories || categories.length === 0) return;

    categories.forEach(async (cat) => {
      try {
        const targetUrl = getBackendUrl(`http://127.0.0.1:5000/api/public/categories/${cat.slug}/subcategories`);
        const res = await fetch(targetUrl).catch(() => null);
        if (res && res.ok) {
          const data = await res.json().catch(() => null);
          if (data && data.success && Array.isArray(data.data)) {
            setSubcategoriesMap((prev) => ({
              ...prev,
              [cat.slug]: data.data,
            }));
          }
        }
      } catch (err) {
        console.error(`Failed to fetch subcategories for ${cat.slug}:`, err);
      }
    });
  }, [categories]);

  const handleMouseEnter = (slug: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setHoveredCategorySlug(slug);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredCategorySlug(null);
    }, 200);
  };

  const hoveredSubcategories = hoveredCategorySlug ? subcategoriesMap[hoveredCategorySlug] : null;

  return (
    <header className={styles.categoryHeader}>
      {/* Desktop Header Navigation */}
      <div
        className={`${styles.categoryHeaderInner} ${styles.desktopCategoryHeader}`}
        style={!shouldShowBack ? { justifyContent: 'flex-end' } : undefined}
      >
        {shouldShowBack && backLinkHref && (
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
        )}

        <nav
          className={styles.categoryTabs}
          aria-label="Product categories"
          onMouseLeave={handleMouseLeave}
        >
          {categories.map((item) => {
            const isActive = item.slug === activeSlug;
            const isHovered = item.slug === hoveredCategorySlug;

            return (
              <div
                key={item._id}
                className={styles.categoryTabWrapper}
                onMouseEnter={() => handleMouseEnter(item.slug)}
              >
                <Link
                  href={`/products/${item.slug}`}
                  className={`${isActive ? styles.categoryTabActive : ''} ${isHovered ? styles.categoryTabHovered : ''}`}
                >
                  {item.name}
                </Link>
              </div>
            );
          })}

          {/* Floating Subcategories Mega Menu Dropdown Popover on Hover */}
          {hoveredCategorySlug && hoveredSubcategories && hoveredSubcategories.length > 0 && (
            <div
              className={styles.categoryMegaMenu}
              onMouseEnter={() => {
                if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
              }}
              onMouseLeave={handleMouseLeave}
            >
              <div className={styles.subcategoryGrid}>
                {hoveredSubcategories.map((sub) => (
                  <Link
                    key={sub._id}
                    href={`/products/${hoveredCategorySlug}?sub=${sub.slug}`}
                    className={styles.subcategoryItem}
                    onClick={() => setHoveredCategorySlug(null)}
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Mobile Integrated Pure White Header Bar matching Navbar */}
      <div className={styles.mobileCategoryBarWrap}>
        <div className={styles.mobileCategoryBarInner}>
          {/* Circular Back Button */}
          {shouldShowBack && backLinkHref && (
            <Link href={backLinkHref} className={styles.mobileBackBtnCircle} aria-label={backLinkText}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
          )}

          {/* Interactive Category Selector Pill */}
          <button
            type="button"
            className={styles.mobileCategoryDropdownToggle}
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            style={!shouldShowBack ? { width: '100%' } : undefined}
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
              const subs = subcategoriesMap[item.slug] || [];

              return (
                <div key={item._id} className={styles.mobileCategoryGroup}>
                  <Link
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

                  {/* Subcategories list on mobile inside accordion */}
                  {subs.length > 0 && (
                    <div className={styles.mobileSubcategoryList}>
                      {subs.map((sub) => (
                        <Link
                          key={sub._id}
                          href={`/products/${item.slug}?sub=${sub.slug}`}
                          className={styles.mobileSubcategoryItem}
                          onClick={() => setIsOpen(false)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
