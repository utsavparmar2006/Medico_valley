'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getBackendUrl } from '@/utils/api';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ARTICLES_DATABASE } from '@/app/blog/data';
import styles from './GlobalNavbar.module.css';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact Us', href: '/contact-us' },
];

interface SearchProduct {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category?: {
    name?: string;
    slug?: string;
  };
}

export default function GlobalNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch products on demand when search is opened
  useEffect(() => {
    if (isSearchOpen && products.length === 0) {
      fetch(getBackendUrl('http://127.0.0.1:5000/api/public/products'))
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setProducts(data.data);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching products for search:', err);
          setLoading(false);
        });
    }
  }, [isSearchOpen, products.length]);

  // Handle Escape key and body scrolling scrolllock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  // Auto focus search input when opened
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchOpen]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (pathname.startsWith('/admin')) {
    return null;
  }


  // Close mobile menu on route change
  // (handled by key change via pathname dependency)

  // Filter products and blogs based on query text
  const filteredProducts = searchQuery.trim() === '' ? [] : products.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.category?.name && item.category.name.toLowerCase().includes(query))
    );
  });

  const filteredBlogs = searchQuery.trim() === '' ? [] : ARTICLES_DATABASE.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.excerpt.toLowerCase().includes(query) ||
      item.highlights.some(h => h.toLowerCase().includes(query))
    );
  });

  return (
    <>
      <header className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>

        <Link href="/" className={styles.logoContainer} style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/logo-medico-transparent.png"
            alt="MedicoValley Logo"
            width={180}
            height={56}
            style={{
              height: '56px',
              width: 'auto',
              objectFit: 'contain',
            }}
          />
        </Link>

        {/* Desktop nav links */}
        <nav className={styles.navLinks} aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={isActive ? styles.navLinkActive : styles.navLink}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.navActions}>
          <button 
            className={`${styles.iconBtn} material-symbols-outlined`} 
            aria-label="Search"
            onClick={() => {
              if (products.length === 0) setLoading(true);
              setIsSearchOpen(true);
            }}
          >
            search
          </button>

          {/* Hamburger - mobile only */}
          <button
            className={styles.hamburgerBtn}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMobileMenuOpen((v) => !v)}
          >
            <span className={`${styles.hamburgerBar} ${isMobileMenuOpen ? styles.bar1Open : ''}`} />
            <span className={`${styles.hamburgerBar} ${isMobileMenuOpen ? styles.bar2Open : ''}`} />
            <span className={`${styles.hamburgerBar} ${isMobileMenuOpen ? styles.bar3Open : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {isMobileMenuOpen && (
        <nav className={styles.mobileMenu} aria-label="Mobile navigation">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={isActive ? styles.mobileNavLinkActive : styles.mobileNavLink}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}

      {/* ── Global Search Overlay ── */}
      {isSearchOpen && (
        <div className={styles.searchOverlay} onClick={() => setIsSearchOpen(false)}>
          <div className={styles.searchModal} onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className={styles.closeSearchBtn} 
              onClick={() => setIsSearchOpen(false)}
              aria-label="Close search"
            >
              ✕
            </button>
            
            <div className={styles.searchHeader}>
              <h2 className={styles.searchHeading}>Global Search</h2>
              <p className={styles.searchSubheading}>Search for medical equipment, categories, or clinical blogs.</p>
              
              <div className={styles.searchFieldWrapper}>
                <span className={`material-symbols-outlined ${styles.searchFieldIcon}`}>search</span>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Type product name or blog title..."
                  className={styles.searchFieldInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className={styles.clearFieldBtn}
                    onClick={() => setSearchQuery('')}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className={styles.searchResultsContainer}>
              {loading && (
                <div className={styles.searchLoader}>
                  <div className={styles.spinner} />
                  <p>Searching Medico Valley database...</p>
                </div>
              )}

              {!loading && searchQuery.trim() !== '' && (
                <div className={styles.searchResultsColumns}>
                  {/* Products Column */}
                  <div className={styles.searchColumn}>
                    <h3 className={styles.columnHeader}>Products ({filteredProducts.length})</h3>
                    {filteredProducts.length > 0 ? (
                      <ul className={styles.resultsList}>
                        {filteredProducts.map((product) => (
                          <li key={product._id} className={styles.resultItem}>
                            <Link 
                              href={`/products/${product.category?.slug || 'general'}/${product.slug}`}
                              onClick={() => setIsSearchOpen(false)}
                              className={styles.resultLink}
                            >
                              <div className={styles.resultDetails}>
                                <span className={styles.resultTitle}>{product.name}</span>
                                <span className={styles.resultCategory}>{product.category?.name || 'General'}</span>
                              </div>
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={styles.noResultsText}>No products match your search query.</p>
                    )}
                  </div>

                  {/* Blogs Column */}
                  <div className={styles.searchColumn}>
                    <h3 className={styles.columnHeader}>Blogs ({filteredBlogs.length})</h3>
                    {filteredBlogs.length > 0 ? (
                      <ul className={styles.resultsList}>
                        {filteredBlogs.map((blog) => (
                          <li key={blog.id} className={styles.resultItem}>
                            <Link 
                              href={`/blog/${blog.slug}`}
                              onClick={() => setIsSearchOpen(false)}
                              className={styles.resultLink}
                            >
                              <div className={styles.resultDetails}>
                                <span className={styles.resultTitle}>{blog.title}</span>
                                <span className={styles.resultCategory}>Blog Article</span>
                              </div>
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={styles.noResultsText}>No blogs match your search query.</p>
                    )}
                  </div>
                </div>
              )}

              {!loading && searchQuery.trim() === '' && (
                <div className={styles.searchQuickLinks}>
                  <h4>Quick Links</h4>
                  <div className={styles.quickLinksGrid}>
                    <Link href="/products" onClick={() => setIsSearchOpen(false)}>
                      All Medical Simulators & Trainers
                    </Link>
                    <Link href="/blog" onClick={() => setIsSearchOpen(false)}>
                      Clinical Competency & Anatomy Blogs
                    </Link>
                    <Link href="/contact-us" onClick={() => setIsSearchOpen(false)}>
                      Contact Medico Valley
                    </Link>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className={styles.scrollTopBtn}
          aria-label="Scroll to top"
        >
          <span className="material-symbols-outlined">arrow_upward</span>
        </button>
      )}
    </>
  );
}
