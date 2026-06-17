'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './dashboard.module.css';

interface CategoryObj {
  _id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
}

interface ProductObj {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  mediaUrls: string[];
  catalogUrl?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Authentication & UI States
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'products' | 'manage'>('overview');
  const [categoriesList, setCategoriesList] = useState<CategoryObj[]>([]);
  const [productsList, setProductsList] = useState<ProductObj[]>([]);

  // Search & Filtering states for Listings Tab
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [manageView, setManageView] = useState<'categories' | 'products'>('products');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [loadingData, setLoadingData] = useState(true);

  // File upload progress feedback
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form State: Categories
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [categoryImgUrl, setCategoryImgUrl] = useState('');

  // Form State: Products
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productCategoryId, setProductCategoryId] = useState('');
  const [productMediaUrls, setProductMediaUrls] = useState<string[]>([]);
  const [productCatalogUrl, setProductCatalogUrl] = useState('');

  // Auth fetch wrapper with automatic silent token refresh interceptor
  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    let token = localStorage.getItem('adminAccessToken');
    const headers = new Headers(options.headers || {});

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    options.headers = headers;

    let response = await fetch(url, options);

    // If unauthorized, check if it was due to token expiration
    if (response.status === 401) {
      const clone = response.clone();
      const data = await clone.json().catch(() => ({}));

      if (data.tokenExpired) {
        console.log('Access token expired. Refreshing token...');

        try {
          // Send request to token refresh endpoint (automatically shares cookie)
          const refreshRes = await fetch('http://localhost:5000/api/admin/refresh', {
            method: 'POST',
            credentials: 'include',
          });
          const refreshData = await refreshRes.json();

          if (refreshRes.ok && refreshData.success) {
            console.log('Access token refreshed successfully.');
            token = refreshData.accessToken;
            localStorage.setItem('adminAccessToken', token!);

            // Re-apply Authorization header and retry the original call
            headers.set('Authorization', `Bearer ${token}`);
            options.headers = headers;
            response = await fetch(url, options);
          } else {
            // Refresh token has expired/revoked, force login
            console.warn('Session expired. Redirecting to login...');
            localStorage.removeItem('adminAccessToken');
            localStorage.removeItem('adminUser');
            router.push('/admin/login');
          }
        } catch (refreshErr) {
          console.error('Token refresh request failed:', refreshErr);
          router.push('/admin/login');
        }
      }
    }
    return response;
  };

  // Check login status & load dashboard data
  useEffect(() => {
    const user = localStorage.getItem('adminUser');
    const token = localStorage.getItem('adminAccessToken');

    if (!user || !token) {
      router.push('/admin/login');
      return;
    }
    setAdminUser(JSON.parse(user));
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      // Fetch Categories
      const catRes = await fetch('http://localhost:5000/api/public/categories');
      const catData = await catRes.json();
      if (catRes.ok && catData.success) {
        setCategoriesList(catData.data);
      }

      // Fetch Products
      const prodRes = await fetch('http://localhost:5000/api/public/products');
      const prodData = await prodRes.json();
      if (prodRes.ok && prodData.success) {
        setProductsList(prodData.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // General single-file uploader calling Multer upload
  const handleFileUpload = async (file: File): Promise<string | null> => {
    setUploadingFile(true);
    setUploadProgress(10);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadProgress(40);
      const response = await authFetch('http://localhost:5000/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(80);
      const data = await response.json();
      setUploadingFile(false);
      setUploadProgress(100);

      if (response.ok && data.success) {
        return data.url;
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'File upload failed.' });
        return null;
      }
    } catch (err) {
      console.error('File upload error:', err);
      setUploadingFile(false);
      setStatusMessage({ type: 'error', text: 'Network error occurred during file upload.' });
      return null;
    }
  };

  // Category Submit
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!categoryName || !categoryDesc || !categoryImgUrl) {
      setStatusMessage({ type: 'error', text: 'All category fields are required.' });
      return;
    }

    startTransition(async () => {
      try {
        const response = await authFetch('http://localhost:5000/api/admin/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: categoryName,
            description: categoryDesc,
            imageUrl: categoryImgUrl,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatusMessage({ type: 'success', text: 'Category created successfully!' });
          setCategoryName('');
          setCategoryDesc('');
          setCategoryImgUrl('');
          loadDashboardData();
          setActiveTab('overview');
        } else {
          setStatusMessage({ type: 'error', text: data.message || 'Category creation failed.' });
        }
      } catch (err) {
        setStatusMessage({ type: 'error', text: 'Could not connect to database.' });
      }
    });
  };

  // Product Submit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!productName || !productDesc || !productCategoryId || productMediaUrls.length === 0) {
      setStatusMessage({ type: 'error', text: 'Name, Description, Category, and at least one image/video are required.' });
      return;
    }

    startTransition(async () => {
      try {
        const response = await authFetch('http://localhost:5000/api/admin/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: productName,
            description: productDesc,
            categoryId: productCategoryId,
            mediaUrls: productMediaUrls,
            catalogUrl: productCatalogUrl || undefined,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatusMessage({ type: 'success', text: 'Product created successfully!' });
          setProductName('');
          setProductDesc('');
          setProductCategoryId('');
          setProductMediaUrls([]);
          setProductCatalogUrl('');
          loadDashboardData();
          setActiveTab('overview');
        } else {
          setStatusMessage({ type: 'error', text: data.message || 'Product creation failed.' });
        }
      } catch (err) {
        setStatusMessage({ type: 'error', text: 'Could not connect to database.' });
      }
    });
  };

  // Delete Handlers
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setStatusMessage(null);

    try {
      const response = await authFetch(`http://localhost:5000/api/admin/products/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMessage({ type: 'success', text: 'Product deleted successfully!' });
        loadDashboardData();
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Product deletion failed.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Could not delete product.' });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Note: Categories with active products cannot be deleted.')) return;
    setStatusMessage(null);

    try {
      const response = await authFetch(`http://localhost:5000/api/admin/categories/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMessage({ type: 'success', text: 'Category deleted successfully!' });
        loadDashboardData();
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Category deletion failed.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Could not delete category.' });
    }
  };

  // Admin Logout Handler
  const handleLogout = async () => {
    try {
      await authFetch('http://localhost:5000/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('adminUser');
      router.push('/admin/login');
    }
  };

  if (!adminUser) {
    return <div className={styles.wrapper}>Loading session...</div>;
  }

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80 } }
  } as const;

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h1>Admin Control Panel</h1>
          <p>Logged in as: <strong>{adminUser.name}</strong> ({adminUser.email})</p>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <span>Log Out</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
        </button>
      </header>

      {/* Main Grid Layout */}
      <div className={styles.dashboardLayout}>

        {/* Sidebar Nav */}
        <aside className={styles.sidebar}>
          <div className={styles.profileBox}>
            <div className={styles.avatar}>
              {adminUser.name.charAt(0).toUpperCase()}
            </div>
            <div className={styles.profileInfo}>
              <h3>{adminUser.name}</h3>
              <p>Administrator</p>
            </div>
          </div>

          <nav className={styles.sidebarNav}>
            <button
              onClick={() => { setActiveTab('overview'); setStatusMessage(null); }}
              className={`${styles.navBtn} ${activeTab === 'overview' ? styles.navBtnActive : ''}`}
              style={{ position: 'relative' }}
            >
              {activeTab === 'overview' && (
                <motion.div
                  layoutId="sidebarActive"
                  className={styles.navActiveBg}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="material-symbols-outlined" style={{ position: 'relative', zIndex: 2 }}>dashboard</span>
              <span style={{ position: 'relative', zIndex: 2 }}>Overview & Lists</span>
            </button>
            <button
              onClick={() => { setActiveTab('manage'); setStatusMessage(null); }}
              className={`${styles.navBtn} ${activeTab === 'manage' ? styles.navBtnActive : ''}`}
              style={{ position: 'relative' }}
            >
              {activeTab === 'manage' && (
                <motion.div
                  layoutId="sidebarActive"
                  className={styles.navActiveBg}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="material-symbols-outlined" style={{ position: 'relative', zIndex: 2 }}>manage_search</span>
              <span style={{ position: 'relative', zIndex: 2 }}>Manage Listings</span>
            </button>
            <button
              onClick={() => { setActiveTab('categories'); setStatusMessage(null); }}
              className={`${styles.navBtn} ${activeTab === 'categories' ? styles.navBtnActive : ''}`}
              style={{ position: 'relative' }}
            >
              {activeTab === 'categories' && (
                <motion.div
                  layoutId="sidebarActive"
                  className={styles.navActiveBg}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="material-symbols-outlined" style={{ position: 'relative', zIndex: 2 }}>category</span>
              <span style={{ position: 'relative', zIndex: 2 }}>Add Category</span>
            </button>
            <button
              onClick={() => { setActiveTab('products'); setStatusMessage(null); }}
              className={`${styles.navBtn} ${activeTab === 'products' ? styles.navBtnActive : ''}`}
              style={{ position: 'relative' }}
            >
              {activeTab === 'products' && (
                <motion.div
                  layoutId="sidebarActive"
                  className={styles.navActiveBg}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="material-symbols-outlined" style={{ position: 'relative', zIndex: 2 }}>inventory</span>
              <span style={{ position: 'relative', zIndex: 2 }}>Add Product</span>
            </button>
          </nav>
        </aside>

        {/* Dynamic Content Panel */}
        <main className={styles.contentArea}>

          {/* Status Notifications */}
          <AnimatePresence mode="wait">
            {statusMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`${styles.statusBanner} ${statusMessage.type === 'success' ? styles.statusSuccess : styles.statusError}`}
              >
                <span className="material-symbols-outlined">
                  {statusMessage.type === 'success' ? 'check_circle' : 'error'}
                </span>
                <span>{statusMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Uploading Progress */}
          {uploadingFile && (
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary)' }}>Uploading asset to local disk... {uploadProgress}%</span>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBar} style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {/* TABS RESOLUTION */}
          {activeTab === 'overview' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}
            >
              {/* Stats Widgets */}
              <div className={styles.statsRow}>
                <motion.div variants={itemVariants} className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <span className="material-symbols-outlined">category</span>
                  </div>
                  <div className={styles.statInfo}>
                    <h3>Total Categories</h3>
                    <p>{categoriesList.length}</p>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <span className="material-symbols-outlined">inventory</span>
                  </div>
                  <div className={styles.statInfo}>
                    <h3>Active Products</h3>
                    <p>{productsList.length}</p>
                  </div>
                </motion.div>
              </div>

              {/* Categories list */}
              <motion.section variants={itemVariants} className={styles.dashboardListSection}>
                <div className={styles.listSectionHeader}>
                  <h2 className={styles.listSectionTitle}>
                    <span className="material-symbols-outlined">category</span>
                    <span>Product Categories</span>
                  </h2>
                </div>

                {loadingData ? (
                  <p>Loading database assets...</p>
                ) : categoriesList.length > 0 ? (
                  <div className={styles.gridList}>
                    {categoriesList.map((cat) => (
                      <div key={cat._id} className={styles.itemCard}>
                        <div className={styles.itemCardImg}>
                          <Image src={cat.imageUrl} alt={cat.name} fill style={{ objectFit: 'cover' }} />
                        </div>
                        <div className={styles.itemCardBody}>
                          <h3 className={styles.itemCardTitle}>{cat.name}</h3>
                          <p className={styles.itemCardDesc}>{cat.description}</p>
                          <div className={styles.itemCardFooter}>
                            <span className={styles.badge}>Category</span>
                            <button
                              onClick={() => handleDeleteCategory(cat._id)}
                              className={styles.deleteActionBtn}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>folder_open</span>
                    <p>No product categories found. Create a category to start building your portfolio.</p>
                  </div>
                )}
              </motion.section>

              {/* Products list */}
              <motion.section variants={itemVariants} className={styles.dashboardListSection}>
                <div className={styles.listSectionHeader}>
                  <h2 className={styles.listSectionTitle}>
                    <span className="material-symbols-outlined">inventory</span>
                    <span>Product Listings</span>
                  </h2>
                </div>

                {loadingData ? (
                  <p>Loading database assets...</p>
                ) : productsList.length > 0 ? (
                  <div className={styles.gridList}>
                    {productsList.map((prod) => (
                      <div key={prod._id} className={styles.itemCard}>
                        <div className={styles.itemCardImg}>
                          {prod.mediaUrls.length > 0 ? (
                            prod.mediaUrls[0].endsWith('.mp4') ? (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0c1829', color: 'var(--color-primary)' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>movie</span>
                              </div>
                            ) : (
                              <Image src={prod.mediaUrls[0]} alt={prod.name} fill style={{ objectFit: 'cover' }} />
                            )
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#071324' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>image</span>
                            </div>
                          )}
                        </div>
                        <div className={styles.itemCardBody}>
                          <h3 className={styles.itemCardTitle}>{prod.name}</h3>
                          <p className={styles.itemCardDesc}>{prod.description}</p>
                          <div className={styles.itemCardFooter}>
                            <span className={styles.badge}>{prod.category?.name || 'Uncategorized'}</span>
                            <button
                              onClick={() => handleDeleteProduct(prod._id)}
                              className={styles.deleteActionBtn}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>inventory_2</span>
                    <p>No products listed in the database. Add a product to showcase technical specifications.</p>
                  </div>
                )}
              </motion.section>
            </motion.div>
          )}

          {/* MANAGE LISTINGS TAB */}
          {activeTab === 'manage' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              <div className={styles.listSectionHeader} style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <h2 className={styles.listSectionTitle}>
                  <span className="material-symbols-outlined">manage_search</span>
                  <span>Manage Catalog Listings</span>
              </h2>
              </div>

              {/* Search and Filters Bar */}
              <div className={styles.manageBar}>
                <div className={styles.searchWrapper}>
                  <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
                  <input
                    type="text"
                    placeholder={manageView === 'products' ? "Search products by name, description, or category..." : "Search categories..."}
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className={styles.clearSearchBtn}
                      onClick={() => setSearchQuery('')}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className={styles.toggleGroup}>
                  <button
                    type="button"
                    onClick={() => { setManageView('products'); setSearchQuery(''); setSelectedCategoryFilter(''); }}
                    className={`${styles.toggleBtn} ${manageView === 'products' ? styles.toggleBtnActive : ''}`}
                    style={{ position: 'relative' }}
                  >
                    {manageView === 'products' && (
                      <motion.div
                        layoutId="toggleActive"
                        className={styles.toggleActiveBg}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span style={{ position: 'relative', zIndex: 2 }}>Products</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setManageView('categories'); setSearchQuery(''); }}
                    className={`${styles.toggleBtn} ${manageView === 'categories' ? styles.toggleBtnActive : ''}`}
                    style={{ position: 'relative' }}
                  >
                    {manageView === 'categories' && (
                      <motion.div
                        layoutId="toggleActive"
                        className={styles.toggleActiveBg}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span style={{ position: 'relative', zIndex: 2 }}>Categories</span>
                  </button>
                </div>
              </div>

              {/* Interactive Category Filter Bar */}
              {manageView === 'products' && (
                <div className={`${styles.categoryFilterBar} no-scrollbar`}>
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryFilter('')}
                    className={`${styles.filterPill} ${selectedCategoryFilter === '' ? styles.filterPillActive : ''}`}
                    style={{ position: 'relative' }}
                  >
                    {selectedCategoryFilter === '' && (
                      <motion.div
                        layoutId="pillActive"
                        className={styles.pillActiveBg}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span style={{ position: 'relative', zIndex: 2 }}>All Products</span>
                    <span className={`${styles.pillCount} ${selectedCategoryFilter === '' ? styles.pillCountActive : ''}`} style={{ position: 'relative', zIndex: 2 }}>
                      {productsList.length}
                    </span>
                  </button>
                  {categoriesList.map((cat) => {
                    const count = productsList.filter(p => p.category?._id === cat._id).length;
                    return (
                      <button
                        key={cat._id}
                        type="button"
                        onClick={() => setSelectedCategoryFilter(cat._id)}
                        className={`${styles.filterPill} ${selectedCategoryFilter === cat._id ? styles.filterPillActive : ''}`}
                        style={{ position: 'relative' }}
                      >
                        {selectedCategoryFilter === cat._id && (
                          <motion.div
                            layoutId="pillActive"
                            className={styles.pillActiveBg}
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                        <span style={{ position: 'relative', zIndex: 2 }}>{cat.name}</span>
                        <span className={`${styles.pillCount} ${selectedCategoryFilter === cat._id ? styles.pillCountActive : ''}`} style={{ position: 'relative', zIndex: 2 }}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {manageView === 'categories' && (
                <div className={styles.categoryFilterBar}>
                  <div className={styles.filterPillActive} style={{ cursor: 'default', position: 'relative' }}>
                    <span>Total Categories</span>
                    <span className={styles.pillCount}>{categoriesList.length}</span>
                  </div>
                </div>
              )}

              {/* Listings Display */}
              {loadingData ? (
                <p>Loading database assets...</p>
              ) : (
                <AnimatePresence mode="popLayout">
                  {manageView === 'categories' ? (
                    // Filtered Categories
                    (() => {
                      const filteredCats = categoriesList.filter(cat => 
                        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        cat.description.toLowerCase().includes(searchQuery.toLowerCase())
                      );

                      return filteredCats.length > 0 ? (
                        <motion.div layout className={styles.gridList} key="cats-grid">
                          <AnimatePresence mode="popLayout">
                            {filteredCats.map((cat) => (
                              <motion.div 
                                layout
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                                key={cat._id} 
                                className={styles.itemCard}
                              >
                                <div className={styles.itemCardImg}>
                                  <Image src={cat.imageUrl} alt={cat.name} fill style={{ objectFit: 'cover' }} />
                                </div>
                                <div className={styles.itemCardBody}>
                                  <h3 className={styles.itemCardTitle}>{cat.name}</h3>
                                  <p className={styles.itemCardDesc}>{cat.description}</p>
                                  <div className={styles.itemCardFooter}>
                                    <span className={styles.badge}>Category</span>
                                    <button 
                                      onClick={() => handleDeleteCategory(cat._id)} 
                                      className={styles.deleteActionBtn}
                                    >
                                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </motion.div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          exit={{ opacity: 0 }} 
                          className={styles.emptyState}
                          key="cats-empty"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>search_off</span>
                          <p>No categories match your search query: "{searchQuery}"</p>
                        </motion.div>
                      );
                    })()
                  ) : (
                    // Filtered Products
                    (() => {
                      const filteredProds = productsList.filter(prod => {
                        const matchesSearch = 
                          prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (prod.category?.name && prod.category.name.toLowerCase().includes(searchQuery.toLowerCase()));
                        
                        const matchesCategory = 
                          !selectedCategoryFilter || 
                          prod.category?._id === selectedCategoryFilter;

                        return matchesSearch && matchesCategory;
                      });

                      return filteredProds.length > 0 ? (
                        <motion.div layout className={styles.gridList} key="prods-grid">
                          <AnimatePresence mode="popLayout">
                            {filteredProds.map((prod) => (
                              <motion.div 
                                layout
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                                key={prod._id} 
                                className={styles.itemCard}
                              >
                                <div className={styles.itemCardImg}>
                                  {prod.mediaUrls.length > 0 ? (
                                    prod.mediaUrls[0].endsWith('.mp4') ? (
                                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0c1829', color: 'var(--color-primary)' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>movie</span>
                                      </div>
                                    ) : (
                                      <Image src={prod.mediaUrls[0]} alt={prod.name} fill style={{ objectFit: 'cover' }} />
                                    )
                                  ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#071324' }}>
                                      <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>image</span>
                                    </div>
                                  )}
                                </div>
                                <div className={styles.itemCardBody}>
                                  <h3 className={styles.itemCardTitle}>{prod.name}</h3>
                                  <p className={styles.itemCardDesc}>{prod.description}</p>
                                  <div className={styles.itemCardFooter}>
                                    <span className={styles.badge}>{prod.category?.name || 'Uncategorized'}</span>
                                    <button 
                                      onClick={() => handleDeleteProduct(prod._id)} 
                                      className={styles.deleteActionBtn}
                                    >
                                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </motion.div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          exit={{ opacity: 0 }} 
                          className={styles.emptyState}
                          key="prods-empty"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>search_off</span>
                          <p>No products match your search/filter criteria.</p>
                        </motion.div>
                      );
                    })()
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          )}

          {/* CREATE CATEGORY FORM */}
          {activeTab === 'categories' && (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleCategorySubmit}
              className={styles.formCard}
            >
              <h2 className={styles.sectionTitle}>New Product Category</h2>

              <div className={styles.grid}>
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label className={styles.label} htmlFor="category-name">Category Name</label>
                  <input
                    id="category-name"
                    type="text"
                    placeholder="e.g. Anatomy Models"
                    className={styles.input}
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                  />
                </div>

                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label className={styles.label} htmlFor="category-desc">Description</label>
                  <input
                    id="category-desc"
                    type="text"
                    placeholder="Brief summary of category range"
                    className={styles.input}
                    value={categoryDesc}
                    onChange={(e) => setCategoryDesc(e.target.value)}
                    required
                  />
                </div>

                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Category Cover Image</label>
                  <label className={styles.uploadBox}>
                    <svg className={styles.uploadIcon} xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                    <span className={styles.uploadText}>Click to upload Category Image</span>
                    <span className={styles.uploadSubtext}>Supports JPG, PNG (Max 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className={styles.fileInput}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleFileUpload(file);
                          if (url) setCategoryImgUrl(url);
                        }
                      }}
                    />
                  </label>

                  {categoryImgUrl && (
                    <div className={styles.previewList}>
                      <div className={styles.previewItem}>
                        <img src={categoryImgUrl} alt="Category Preview" className={styles.previewImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" className={styles.removePreviewBtn} onClick={() => setCategoryImgUrl('')}>✕</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="ctaButton"
                style={{ width: '220px', marginTop: '16px', background: 'var(--color-primary)', border: 'none', padding: '14px', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                disabled={isPending || uploadingFile || !categoryImgUrl}
              >
                Create Category
              </button>
            </motion.form>
          )}

          {/* CREATE PRODUCT FORM */}
          {activeTab === 'products' && (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleProductSubmit}
              className={styles.formCard}
            >
              <h2 className={styles.sectionTitle}>New Product Listing</h2>

              <div className={styles.grid}>
                <div className={styles.inputGroup}>
                  <label className={styles.label} htmlFor="product-name">Product Name</label>
                  <input
                    id="product-name"
                    type="text"
                    placeholder="e.g. Human Skull Model"
                    className={styles.input}
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label} htmlFor="product-category">Category</label>
                  <select
                    id="product-category"
                    className={styles.input}
                    value={productCategoryId}
                    onChange={(e) => setProductCategoryId(e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    {categoriesList.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label className={styles.label} htmlFor="product-desc">Description</label>
                  <textarea
                    id="product-desc"
                    placeholder="Enter detailed technical description of the product"
                    className={styles.input}
                    rows={4}
                    value={productDesc}
                    onChange={(e) => setProductDesc(e.target.value)}
                    required
                  />
                </div>

                {/* Multiple image / video files upload */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Product Media (Images or Videos)</label>
                  <label className={styles.uploadBox}>
                    <svg className={styles.uploadIcon} xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                    <span className={styles.uploadText}>Click to upload Product Image/Video</span>
                    <span className={styles.uploadSubtext}>Supports PNG, JPG, MP4 (Max 100MB)</span>
                    <input
                      type="file"
                      accept="image/*,video/mp4"
                      className={styles.fileInput}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleFileUpload(file);
                          if (url) {
                            setProductMediaUrls((prev) => [...prev, url]);
                          }
                        }
                      }}
                    />
                  </label>

                  {productMediaUrls.length > 0 && (
                    <div className={styles.previewList}>
                      {productMediaUrls.map((url, index) => {
                        const isVideo = url.endsWith('.mp4');
                        return (
                          <div key={index} className={styles.previewItem}>
                            {isVideo ? (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222' }}>
                                <span style={{ fontSize: '10px' }}>🎬 Video</span>
                              </div>
                            ) : (
                              <img src={url} alt={`Media Preview ${index}`} className={styles.previewImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                            <button
                              type="button"
                              className={styles.removePreviewBtn}
                              onClick={() => setProductMediaUrls((prev) => prev.filter((_, idx) => idx !== index))}
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Catalog PDF Brochure file upload */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Product Catalog Brochure (PDF)</label>
                  {!productCatalogUrl ? (
                    <label className={styles.uploadBox} style={{ padding: '20px' }}>
                      <span className={styles.uploadText} style={{ fontSize: '0.85rem' }}>Click to upload Catalog Brochure PDF</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        className={styles.fileInput}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleFileUpload(file);
                            if (url) setProductCatalogUrl(url);
                          }
                        }}
                      />
                    </label>
                  ) : (
                    <div className={styles.pdfBadge}>
                      <span>📄 {productCatalogUrl.split('/').pop()}</span>
                      <button type="button" onClick={() => setProductCatalogUrl('')}>Delete PDF</button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="ctaButton"
                style={{ width: '220px', marginTop: '16px', background: 'var(--color-primary)', border: 'none', padding: '14px', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                disabled={isPending || uploadingFile || productMediaUrls.length === 0}
              >
                Create Product
              </button>
            </motion.form>
          )}

        </main>
      </div>
    </div>
  );
}
