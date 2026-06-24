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

interface DeltaDifferenceCardObj {
  _id: string;
  title: string;
  category: string;
  description: string;
  initials: string;
  iconImage?: string;
  displayOrder: number;
  isActive: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Authentication & UI States
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'products' | 'manage' | 'categoryDetail' | 'productDetail' | 'inquiries' | 'difference'>('overview');
  const [categoriesList, setCategoriesList] = useState<CategoryObj[]>([]);
  const [productsList, setProductsList] = useState<ProductObj[]>([]);
  const [inquiriesList, setInquiriesList] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryObj | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductObj | null>(null);
  const [detailReturnTab, setDetailReturnTab] = useState<'overview' | 'manage'>('overview');

  // Detail editing state
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryDesc, setEditCategoryDesc] = useState('');
  const [editCategoryImage, setEditCategoryImage] = useState('');
  const [editProductName, setEditProductName] = useState('');
  const [editProductDesc, setEditProductDesc] = useState('');
  const [editProductCategoryId, setEditProductCategoryId] = useState('');
  const [editProductMedia, setEditProductMedia] = useState<string[]>([]);
  const [editProductCatalog, setEditProductCatalog] = useState('');

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

  // Delta Difference Cards states
  const [deltaCardsList, setDeltaCardsList] = useState<DeltaDifferenceCardObj[]>([]);
  const [editingDeltaCard, setEditingDeltaCard] = useState<DeltaDifferenceCardObj | null>(null);

  // Creation form states
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardCategory, setNewCardCategory] = useState('');
  const [newCardDesc, setNewCardDesc] = useState('');
  const [newCardInitials, setNewCardInitials] = useState('');
  const [newCardOrder, setNewCardOrder] = useState<number>(1);
  const [newCardActive, setNewCardActive] = useState(true);

  // Editing form states
  const [editCardTitle, setEditCardTitle] = useState('');
  const [editCardCategory, setEditCardCategory] = useState('');
  const [editCardDesc, setEditCardDesc] = useState('');
  const [editCardInitials, setEditCardInitials] = useState('');
  const [editCardOrder, setEditCardOrder] = useState<number>(1);
  const [editCardActive, setEditCardActive] = useState(true);

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

      // Fetch Inquiries (protected)
      const inqRes = await authFetch('http://localhost:5000/api/admin/inquiries');
      const inqData = await inqRes.json();
      if (inqRes.ok && inqData.success) {
        setInquiriesList(inqData.data);
      }

      // Fetch Delta Difference cards (protected)
      const deltaRes = await authFetch('http://localhost:5000/api/admin/delta-difference');
      const deltaData = await deltaRes.json();
      if (deltaRes.ok && deltaData.success) {
        setDeltaCardsList(deltaData.data);
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

  const openCategoryDetail = (category: CategoryObj, returnTab: 'overview' | 'manage' = 'overview') => {
    setSelectedCategory(category);
    setDetailReturnTab(returnTab);
    setEditCategoryName(category.name);
    setEditCategoryDesc(category.description);
    setEditCategoryImage(category.imageUrl);
    setStatusMessage(null);
    setActiveTab('categoryDetail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProductDetail = (product: ProductObj, returnTab: 'overview' | 'manage' = 'overview') => {
    setSelectedProduct(product);
    setDetailReturnTab(returnTab);
    setEditProductName(product.name);
    setEditProductDesc(product.description);
    setEditProductCategoryId(product.category?._id || '');
    setEditProductMedia(product.mediaUrls);
    setEditProductCatalog(product.catalogUrl || '');
    setStatusMessage(null);
    setActiveTab('productDetail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !editCategoryName || !editCategoryDesc || !editCategoryImage) return;

    setStatusMessage(null);
    startTransition(async () => {
      try {
        const response = await authFetch(`http://localhost:5000/api/admin/categories/${selectedCategory._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editCategoryName,
            description: editCategoryDesc,
            imageUrl: editCategoryImage,
          }),
        });
        const data = await response.json();

        if (response.ok && data.success) {
          setSelectedCategory(data.data);
          setStatusMessage({ type: 'success', text: 'Category changes saved successfully.' });
          await loadDashboardData();
        } else {
          setStatusMessage({ type: 'error', text: data.message || 'Category update failed.' });
        }
      } catch {
        setStatusMessage({ type: 'error', text: 'Could not update category.' });
      }
    });
  };

  const handleProductUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !editProductName || !editProductDesc || !editProductCategoryId || editProductMedia.length === 0) return;

    setStatusMessage(null);
    startTransition(async () => {
      try {
        const response = await authFetch(`http://localhost:5000/api/admin/products/${selectedProduct._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editProductName,
            description: editProductDesc,
            categoryId: editProductCategoryId,
            mediaUrls: editProductMedia,
            catalogUrl: editProductCatalog || undefined,
          }),
        });
        const data = await response.json();

        if (response.ok && data.success) {
          setSelectedProduct(data.data);
          setStatusMessage({ type: 'success', text: 'Product changes saved successfully.' });
          await loadDashboardData();
        } else {
          setStatusMessage({ type: 'error', text: data.message || 'Product update failed.' });
        }
      } catch {
        setStatusMessage({ type: 'error', text: 'Could not update product.' });
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
        await loadDashboardData();
        if (selectedProduct?._id === id) {
          setSelectedProduct(null);
          setActiveTab(detailReturnTab);
        }
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
        await loadDashboardData();
        if (selectedCategory?._id === id) {
          setSelectedCategory(null);
          setActiveTab(detailReturnTab);
        }
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

  // Inquiry Status Handler
  const handleUpdateInquiryStatus = async (inquiryId: string, newStatus: string) => {
    try {
      const res = await authFetch(`http://localhost:5000/api/admin/inquiries/${inquiryId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: 'success', text: 'Inquiry status updated successfully.' });
        setInquiriesList((prev) =>
          prev.map((inq) => (inq._id === inquiryId ? { ...inq, status: newStatus } : inq))
        );
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Failed to update status.' });
      }
    } catch (err) {
      console.error('Update status error:', err);
      setStatusMessage({ type: 'error', text: 'Network error updating inquiry status.' });
    }
  };

  // Delta Difference Card CRUD Handlers
  const handleDeltaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (deltaCardsList.length >= 5) {
      setStatusMessage({ type: 'error', text: 'You have reached the maximum limit of 5 cards.' });
      return;
    }

    if (!newCardTitle || !newCardCategory || !newCardDesc || !newCardInitials || newCardOrder === undefined) {
      setStatusMessage({ type: 'error', text: 'All card fields are required.' });
      return;
    }

    startTransition(async () => {
      try {
        const response = await authFetch('http://localhost:5000/api/admin/delta-difference', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: newCardTitle,
            category: newCardCategory,
            description: newCardDesc,
            initials: newCardInitials,
            displayOrder: Number(newCardOrder),
            isActive: newCardActive,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatusMessage({ type: 'success', text: 'Card created successfully!' });
          setNewCardTitle('');
          setNewCardCategory('');
          setNewCardDesc('');
          setNewCardInitials('');
          setNewCardOrder(1);
          setNewCardActive(true);
          await loadDashboardData();
        } else {
          setStatusMessage({ type: 'error', text: data.message || 'Card creation failed.' });
        }
      } catch (err) {
        setStatusMessage({ type: 'error', text: 'Could not connect to database.' });
      }
    });
  };

  const handleDeltaUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeltaCard) return;
    setStatusMessage(null);

    if (!editCardTitle || !editCardCategory || !editCardDesc || !editCardInitials || editCardOrder === undefined) {
      setStatusMessage({ type: 'error', text: 'All card fields are required.' });
      return;
    }

    startTransition(async () => {
      try {
        const response = await authFetch(`http://localhost:5000/api/admin/delta-difference/${editingDeltaCard._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: editCardTitle,
            category: editCardCategory,
            description: editCardDesc,
            initials: editCardInitials,
            displayOrder: Number(editCardOrder),
            isActive: editCardActive,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatusMessage({ type: 'success', text: 'Card updated successfully!' });
          setEditingDeltaCard(null);
          await loadDashboardData();
        } else {
          setStatusMessage({ type: 'error', text: data.message || 'Card update failed.' });
        }
      } catch (err) {
        setStatusMessage({ type: 'error', text: 'Could not connect to database.' });
      }
    });
  };

  const handleDeleteDeltaCard = async (id: string) => {
    if (deltaCardsList.length <= 5) {
      alert('Deletion blocked: A minimum of 5 cards is required to maintain the homepage layout.');
      return;
    }

    if (!confirm('Are you sure you want to delete this card?')) return;
    setStatusMessage(null);

    try {
      const response = await authFetch(`http://localhost:5000/api/admin/delta-difference/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMessage({ type: 'success', text: 'Card deleted successfully!' });
        await loadDashboardData();
        if (editingDeltaCard?._id === id) {
          setEditingDeltaCard(null);
        }
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Card deletion failed.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Could not delete card.' });
    }
  };

  const openDeltaEdit = (card: DeltaDifferenceCardObj) => {
    setEditingDeltaCard(card);
    setEditCardTitle(card.title);
    setEditCardCategory(card.category);
    setEditCardDesc(card.description);
    setEditCardInitials(card.initials);
    setEditCardOrder(card.displayOrder);
    setEditCardActive(card.isActive);
    setStatusMessage(null);
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
          <h1>Catalog Management</h1>
          <p>Manage Medico Valley categories, products, and published assets.</p>
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
              className={`${styles.navBtn} ${(activeTab === 'overview' || (['categoryDetail', 'productDetail'].includes(activeTab) && detailReturnTab === 'overview')) ? styles.navBtnActive : ''}`}
              style={{ position: 'relative' }}
            >
              {(activeTab === 'overview' || (['categoryDetail', 'productDetail'].includes(activeTab) && detailReturnTab === 'overview')) && (
                <motion.div
                  layoutId="sidebarActive"
                  className={styles.navActiveBg}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="material-symbols-outlined" style={{ position: 'relative', zIndex: 2 }}>dashboard</span>
              <span style={{ position: 'relative', zIndex: 2 }}>Dashboard</span>
            </button>
            <button
              onClick={() => { setActiveTab('manage'); setStatusMessage(null); }}
              className={`${styles.navBtn} ${(activeTab === 'manage' || (['categoryDetail', 'productDetail'].includes(activeTab) && detailReturnTab === 'manage')) ? styles.navBtnActive : ''}`}
              style={{ position: 'relative' }}
            >
              {(activeTab === 'manage' || (['categoryDetail', 'productDetail'].includes(activeTab) && detailReturnTab === 'manage')) && (
                <motion.div
                  layoutId="sidebarActive"
                  className={styles.navActiveBg}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="material-symbols-outlined" style={{ position: 'relative', zIndex: 2 }}>manage_search</span>
              <span style={{ position: 'relative', zIndex: 2 }}>Catalog Listings</span>
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
              <span style={{ position: 'relative', zIndex: 2 }}>New Category</span>
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
              <span style={{ position: 'relative', zIndex: 2 }}>New Product</span>
            </button>
            <button
              onClick={() => { setActiveTab('inquiries'); setStatusMessage(null); }}
              className={`${styles.navBtn} ${activeTab === 'inquiries' ? styles.navBtnActive : ''}`}
              style={{ position: 'relative' }}
            >
              {activeTab === 'inquiries' && (
                <motion.div
                  layoutId="sidebarActive"
                  className={styles.navActiveBg}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="material-symbols-outlined" style={{ position: 'relative', zIndex: 2 }}>mail</span>
              <span style={{ position: 'relative', zIndex: 2 }}>Inquiries</span>
            </button>
            <button
              onClick={() => { setActiveTab('difference'); setStatusMessage(null); setEditingDeltaCard(null); }}
              className={`${styles.navBtn} ${activeTab === 'difference' ? styles.navBtnActive : ''}`}
              style={{ position: 'relative' }}
            >
              {activeTab === 'difference' && (
                <motion.div
                  layoutId="sidebarActive"
                  className={styles.navActiveBg}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="material-symbols-outlined" style={{ position: 'relative', zIndex: 2 }}>star</span>
              <span style={{ position: 'relative', zIndex: 2 }}>Delta Difference</span>
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
              <span style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Uploading asset to local disk... {uploadProgress}%</span>
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
                  <div className={styles.categoryOverviewGrid}>
                    {categoriesList.map((cat) => (
                      <button
                        key={cat._id}
                        type="button"
                        className={styles.categoryOverviewCard}
                        onClick={() => openCategoryDetail(cat)}
                      >
                        <div className={styles.categoryOverviewImage}>
                          <Image src={cat.imageUrl} alt={cat.name} fill sizes="(max-width: 900px) 100vw, 33vw" />
                        </div>
                        <div className={styles.categoryOverviewName}>
                          <h3>{cat.name}</h3>
                          <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                        </div>
                      </button>
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
                  <div className={styles.productOverviewGrid}>
                    {productsList.map((prod) => {
                      return (
                        <button
                          key={prod._id}
                          type="button"
                          className={styles.productOverviewCard}
                          onClick={() => openProductDetail(prod)}
                        >
                          <div className={styles.productOverviewImage}>
                            {prod.mediaUrls.length > 0 && !prod.mediaUrls[0].endsWith('.mp4') ? (
                              <Image
                                src={prod.mediaUrls[0]}
                                alt={prod.name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 25vw"
                              />
                            ) : (
                              <div className={styles.mediaFallback}>
                                <span className="material-symbols-outlined">
                                  {prod.mediaUrls[0]?.endsWith('.mp4') ? 'movie' : 'image'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className={styles.productOverviewName}>
                            <h3>{prod.name}</h3>
                            <span aria-hidden="true">-&gt;</span>
                          </div>
                        </button>
                      );
                    })}
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

          {activeTab === 'categoryDetail' && selectedCategory && (
            <motion.form
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleCategoryUpdate}
              className={styles.adminDetailPage}
            >
              <div className={styles.adminDetailHeader}>
                <div>
                  <button type="button" className={styles.backButton} onClick={() => setActiveTab(detailReturnTab)}>
                    <span className="material-symbols-outlined">arrow_back</span>
                    {detailReturnTab === 'manage' ? 'Catalog Listings' : 'Dashboard'}
                  </button>
                  <span className={styles.detailEyebrow}>Category Details</span>
                  <h2>{selectedCategory.name}</h2>
                </div>
                <button
                  type="button"
                  className={styles.detailDeleteButton}
                  onClick={() => handleDeleteCategory(selectedCategory._id)}
                >
                  <span className="material-symbols-outlined">delete</span>
                  Delete Category
                </button>
              </div>

              <div className={styles.categoryDetailLayout}>
                <section className={styles.detailMediaPanel}>
                  <div className={styles.categoryDetailImage}>
                    <Image src={editCategoryImage} alt={editCategoryName} fill sizes="(max-width: 900px) 100vw, 45vw" />
                  </div>
                  <label className={styles.detailUploadButton}>
                    <span className="material-symbols-outlined">upload</span>
                    Replace Cover Image
                    <input
                      type="file"
                      accept="image/*"
                      className={styles.fileInput}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleFileUpload(file);
                          if (url) setEditCategoryImage(url);
                        }
                      }}
                    />
                  </label>
                </section>

                <section className={styles.detailEditPanel}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="edit-category-name">Category Name</label>
                    <input id="edit-category-name" className={styles.input} value={editCategoryName} onChange={(e) => setEditCategoryName(e.target.value)} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="edit-category-description">Description</label>
                    <textarea id="edit-category-description" className={styles.input} rows={8} value={editCategoryDesc} onChange={(e) => setEditCategoryDesc(e.target.value)} required />
                  </div>
                  <div className={styles.detailActions}>
                    <button type="button" className={styles.secondaryButton} onClick={() => setActiveTab(detailReturnTab)}>Cancel</button>
                    <button type="submit" className={styles.primaryButton} disabled={isPending || uploadingFile}>
                      <span className="material-symbols-outlined">save</span>
                      {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </section>
              </div>
            </motion.form>
          )}

          {activeTab === 'productDetail' && selectedProduct && (
            <motion.form
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleProductUpdate}
              className={styles.adminDetailPage}
            >
              <div className={styles.adminDetailHeader}>
                <div>
                  <button type="button" className={styles.backButton} onClick={() => setActiveTab(detailReturnTab)}>
                    <span className="material-symbols-outlined">arrow_back</span>
                    {detailReturnTab === 'manage' ? 'Catalog Listings' : 'Dashboard'}
                  </button>
                  <span className={styles.detailEyebrow}>Product Details</span>
                  <h2>{selectedProduct.name}</h2>
                </div>
                <button
                  type="button"
                  className={styles.detailDeleteButton}
                  onClick={() => handleDeleteProduct(selectedProduct._id)}
                >
                  <span className="material-symbols-outlined">delete</span>
                  Delete Product
                </button>
              </div>

              <div className={styles.productDetailLayout}>
                <section className={styles.detailMediaPanel}>
                  <div className={styles.adminDetailMediaGrid}>
                    {editProductMedia.map((url, index) => (
                      <div key={`${url}-${index}`} className={styles.adminDetailMediaItem}>
                        {url.endsWith('.mp4') ? (
                          <video src={url} controls />
                        ) : (
                          <Image src={url} alt={`${editProductName} media ${index + 1}`} fill sizes="(max-width: 900px) 50vw, 25vw" />
                        )}
                        <button
                          type="button"
                          aria-label={`Remove media ${index + 1}`}
                          onClick={() => setEditProductMedia((current) => current.filter((_, mediaIndex) => mediaIndex !== index))}
                        >
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <label className={styles.detailUploadButton}>
                    <span className="material-symbols-outlined">add_photo_alternate</span>
                    Add Image or Video
                    <input
                      type="file"
                      accept="image/*,video/mp4"
                      className={styles.fileInput}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleFileUpload(file);
                          if (url) setEditProductMedia((current) => [...current, url]);
                        }
                      }}
                    />
                  </label>
                </section>

                <section className={styles.detailEditPanel}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="edit-product-name">Product Name</label>
                    <input id="edit-product-name" className={styles.input} value={editProductName} onChange={(e) => setEditProductName(e.target.value)} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="edit-product-category">Category</label>
                    <select id="edit-product-category" className={styles.input} value={editProductCategoryId} onChange={(e) => setEditProductCategoryId(e.target.value)} required>
                      <option value="">Select Category</option>
                      {categoriesList.map((category) => (
                        <option key={category._id} value={category._id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="edit-product-description">Description</label>
                    <textarea id="edit-product-description" className={styles.input} rows={7} value={editProductDesc} onChange={(e) => setEditProductDesc(e.target.value)} required />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Product Brochure (PDF)</label>
                    {editProductCatalog ? (
                      <div className={styles.detailPdfRow}>
                        <a href={editProductCatalog} target="_blank" rel="noopener noreferrer">
                          <span className="material-symbols-outlined">picture_as_pdf</span>
                          View Current PDF
                        </a>
                        <button type="button" onClick={() => setEditProductCatalog('')}>Remove</button>
                      </div>
                    ) : (
                      <span className={styles.noDocumentText}>No brochure attached</span>
                    )}
                    <label className={styles.detailUploadButton}>
                      <span className="material-symbols-outlined">upload_file</span>
                      {editProductCatalog ? 'Replace PDF' : 'Upload PDF'}
                      <input
                        type="file"
                        accept="application/pdf"
                        className={styles.fileInput}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleFileUpload(file);
                            if (url) setEditProductCatalog(url);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className={styles.detailActions}>
                    <button type="button" className={styles.secondaryButton} onClick={() => setActiveTab(detailReturnTab)}>Cancel</button>
                    <button type="submit" className={styles.primaryButton} disabled={isPending || uploadingFile || editProductMedia.length === 0}>
                      <span className="material-symbols-outlined">save</span>
                      {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </section>
              </div>
            </motion.form>
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
                        <motion.div layout className={styles.categoryOverviewGrid} key="cats-grid">
                          <AnimatePresence mode="popLayout">
                            {filteredCats.map((cat) => (
                              <motion.button
                                layout
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                                key={cat._id} 
                                type="button"
                                className={styles.categoryOverviewCard}
                                onClick={() => openCategoryDetail(cat, 'manage')}
                              >
                                <div className={styles.categoryOverviewImage}>
                                  <Image src={cat.imageUrl} alt={cat.name} fill sizes="(max-width: 900px) 100vw, 33vw" />
                                </div>
                                <div className={styles.categoryOverviewName}>
                                  <h3>{cat.name}</h3>
                                  <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                                </div>
                              </motion.button>
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
                        <motion.div layout className={styles.productOverviewGrid} key="prods-grid">
                          <AnimatePresence mode="popLayout">
                            {filteredProds.map((prod) => (
                              <motion.button
                                layout
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                                key={prod._id} 
                                type="button"
                                className={styles.productOverviewCard}
                                onClick={() => openProductDetail(prod, 'manage')}
                              >
                                <div className={styles.productOverviewImage}>
                                  {prod.mediaUrls.length > 0 && !prod.mediaUrls[0].endsWith('.mp4') ? (
                                    <Image src={prod.mediaUrls[0]} alt={prod.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 25vw" />
                                  ) : (
                                    <div className={styles.mediaFallback}>
                                      <span className="material-symbols-outlined">{prod.mediaUrls[0]?.endsWith('.mp4') ? 'movie' : 'image'}</span>
                                    </div>
                                  )}
                                </div>
                                <div className={styles.productOverviewName}>
                                  <h3>{prod.name}</h3>
                                  <span aria-hidden="true">-&gt;</span>
                                </div>
                              </motion.button>
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
                style={{ width: '220px', marginTop: '16px', background: 'var(--primary)', border: 'none', padding: '14px', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
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
                              <div className={styles.mediaFallback}>
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
                style={{ width: '220px', marginTop: '16px', background: 'var(--primary)', border: 'none', padding: '14px', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                disabled={isPending || uploadingFile || productMediaUrls.length === 0}
              >
                Create Product
              </button>
            </motion.form>
          )}

          {activeTab === 'inquiries' && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.dashboardListSection}
            >
              <div className={styles.listSectionHeader}>
                <h2 className={styles.listSectionTitle}>
                  <span className="material-symbols-outlined">mail</span>
                  <span>Customer Quotation Inquiries</span>
                </h2>
              </div>

              {inquiriesList.length > 0 ? (
                <div style={{ overflowX: 'auto', width: '100%', marginTop: '8px' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    color: '#334155',
                  }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #cbd5e1', color: '#475569', fontSize: '0.85rem' }}>
                        <th style={{ padding: '12px 16px' }}>Inquiry ID</th>
                        <th style={{ padding: '12px 16px' }}>Date</th>
                        <th style={{ padding: '12px 16px' }}>Product</th>
                        <th style={{ padding: '12px 16px' }}>Quantity</th>
                        <th style={{ padding: '12px 16px' }}>Customer</th>
                        <th style={{ padding: '12px 16px' }}>Institution</th>
                        <th style={{ padding: '12px 16px' }}>City</th>
                        <th style={{ padding: '12px 16px' }}>Contact</th>
                        <th style={{ padding: '12px 16px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inquiriesList.map((inq) => {
                        const dateStr = new Date(inq.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        });
                        const timeStr = new Date(inq.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <tr key={inq._id} style={{
                            borderBottom: '1px solid #e2e8f0',
                            fontSize: '0.9rem',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(10, 141, 147, 0.03)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '16px', fontWeight: 'bold', color: '#0A8D93' }}>{inq.inquiryId}</td>
                            <td style={{ padding: '16px', color: '#475569', fontSize: '0.8rem' }}>
                              <div>{dateStr}</div>
                              <div style={{ opacity: 0.7 }}>{timeStr}</div>
                            </td>
                            <td style={{ padding: '16px' }}>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{inq.productName}</div>
                              <span style={{ fontSize: '0.75rem', color: '#08777d', background: 'rgba(10, 141, 147, 0.08)', padding: '2px 6px', borderRadius: '4px' }}>{inq.category}</span>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', color: '#0f172a' }}>{inq.quantity}</td>
                            <td style={{ padding: '16px' }}>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{inq.customerName}</div>
                              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{inq.email}</div>
                            </td>
                            <td style={{ padding: '16px', color: '#334155' }}>{inq.institution}</td>
                            <td style={{ padding: '16px', color: '#334155' }}>{inq.city}</td>
                            <td style={{ padding: '16px', fontSize: '0.8rem', color: '#334155' }}>{inq.phone}</td>
                            <td style={{ padding: '16px' }}>
                              <select
                                value={inq.status}
                                onChange={(e) => handleUpdateInquiryStatus(inq._id, e.target.value)}
                                style={{
                                  background: inq.status === 'Completed' ? 'rgba(16, 185, 129, 0.15)' :
                                              inq.status === 'Quoted' ? 'rgba(59, 130, 246, 0.15)' :
                                              inq.status === 'Contacted' ? 'rgba(245, 158, 11, 0.15)' :
                                              'rgba(239, 68, 68, 0.15)',
                                  color: inq.status === 'Completed' ? '#10b981' :
                                         inq.status === 'Quoted' ? '#3b82f6' :
                                         inq.status === 'Contacted' ? '#f59e0b' :
                                         '#ef4444',
                                  border: `1px solid ${
                                    inq.status === 'Completed' ? 'rgba(16, 185, 129, 0.3)' :
                                    inq.status === 'Quoted' ? 'rgba(59, 130, 246, 0.3)' :
                                    inq.status === 'Contacted' ? 'rgba(245, 158, 11, 0.3)' :
                                    'rgba(239, 68, 68, 0.3)'
                                  }`,
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  fontSize: '0.82rem',
                                  fontWeight: 600,
                                  outline: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                <option value="Pending" style={{ background: '#0b1f3a', color: '#ef4444' }}>Pending</option>
                                <option value="Contacted" style={{ background: '#0b1f3a', color: '#f59e0b' }}>Contacted</option>
                                <option value="Quoted" style={{ background: '#0b1f3a', color: '#3b82f6' }}>Quoted</option>
                                <option value="Completed" style={{ background: '#0b1f3a', color: '#10b981' }}>Completed</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>inbox</span>
                  <p>No quotation inquiries received yet.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'difference' && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
            >
              <div className={styles.listSectionHeader}>
                <h2 className={styles.listSectionTitle}>
                  <span className="material-symbols-outlined">star</span>
                  <span>Delta Difference Cards</span>
                </h2>
              </div>

              {editingDeltaCard ? (
                <form onSubmit={handleDeltaUpdate} className={styles.formCard}>
                  <h3 className={styles.sectionTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Edit Card details</span>
                    <button type="button" onClick={() => setEditingDeltaCard(null)} className={styles.secondaryButton} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                      Back to list
                    </button>
                  </h3>
                  <div className={styles.grid}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label} htmlFor="edit-card-title">Title / Card Header</label>
                      <input
                        id="edit-card-title"
                        type="text"
                        placeholder="e.g. Anatomical Models"
                        className={styles.input}
                        value={editCardTitle}
                        onChange={(e) => setEditCardTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.label} htmlFor="edit-card-category">Category</label>
                      <input
                        id="edit-card-category"
                        type="text"
                        placeholder="e.g. Anatomy"
                        className={styles.input}
                        value={editCardCategory}
                        onChange={(e) => setEditCardCategory(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.label} htmlFor="edit-card-initials">Initials (2 letters)</label>
                      <input
                        id="edit-card-initials"
                        type="text"
                        maxLength={2}
                        placeholder="e.g. AM"
                        className={styles.input}
                        value={editCardInitials}
                        onChange={(e) => setEditCardInitials(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.label} htmlFor="edit-card-order">Display Order</label>
                      <input
                        id="edit-card-order"
                        type="number"
                        placeholder="e.g. 1"
                        className={styles.input}
                        value={editCardOrder}
                        onChange={(e) => setEditCardOrder(Number(e.target.value))}
                        required
                      />
                    </div>
                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                      <label className={styles.label} htmlFor="edit-card-desc">Description</label>
                      <textarea
                        id="edit-card-desc"
                        rows={4}
                        placeholder="Enter card description..."
                        className={styles.input}
                        value={editCardDesc}
                        onChange={(e) => setEditCardDesc(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.inputGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                      <input
                        id="edit-card-active"
                        type="checkbox"
                        checked={editCardActive}
                        onChange={(e) => setEditCardActive(e.target.checked)}
                      />
                      <label className={styles.label} htmlFor="edit-card-active" style={{ margin: 0 }}>Active / Show on homepage</label>
                    </div>
                  </div>
                  <div className={styles.detailActions} style={{ marginTop: '24px' }}>
                    <button type="button" onClick={() => setEditingDeltaCard(null)} className={styles.secondaryButton}>Cancel</button>
                    <button type="submit" disabled={isPending} className={styles.primaryButton}>
                      <span className="material-symbols-outlined">save</span>
                      {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {deltaCardsList.length <= 5 && (
                    <div className={styles.statusBanner} style={{
                      background: 'rgba(245, 158, 11, 0.12)',
                      color: '#d97706',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      padding: '16px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'start',
                      gap: '12px',
                      fontSize: '0.88rem',
                      lineHeight: '1.4'
                    }}>
                      <span className="material-symbols-outlined" style={{ color: '#d97706', fontSize: '20px' }}>warning</span>
                      <div>
                        <strong>Homepage Layout Warning:</strong> Exactly 5 cards are recommended to maintain the visually identical, pinned GSAP scrolling layout on the homepage. Deletion of cards is blocked while count is &le; 5.
                      </div>
                    </div>
                  )}
                  <div style={{ overflowX: 'auto', width: '100%', marginTop: '8px' }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      textAlign: 'left',
                      color: '#334155',
                    }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #cbd5e1', color: '#475569', fontSize: '0.85rem' }}>
                          <th style={{ padding: '12px 16px' }}>Order</th>
                          <th style={{ padding: '12px 16px' }}>Initials</th>
                          <th style={{ padding: '12px 16px' }}>Title</th>
                          <th style={{ padding: '12px 16px' }}>Category</th>
                          <th style={{ padding: '12px 16px' }}>Description</th>
                          <th style={{ padding: '12px 16px' }}>Status</th>
                          <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deltaCardsList.length > 0 ? (
                          deltaCardsList.map((card) => (
                            <tr key={card._id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem', transition: 'background 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(10, 141, 147, 0.03)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#0A8D93' }}>{card.displayOrder}</td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10, 141, 147, 0.08)', color: '#0A8D93', width: '32px', height: '32px', borderRadius: '50%', fontWeight: 'bold', fontSize: '0.8rem', border: '1px solid rgba(10, 141, 147, 0.15)' }}>
                                  {card.initials}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{card.title}</td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ fontSize: '0.75rem', color: '#08777d', background: 'rgba(10, 141, 147, 0.08)', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>{card.category}</span>
                              </td>
                              <td style={{ padding: '12px 16px', color: '#475569', fontSize: '0.85rem', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {card.description}
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: card.isActive ? '#10b981' : '#ef4444',
                                  background: card.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                  padding: '2px 8px',
                                  borderRadius: '9999px',
                                  border: `1px solid ${card.isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                }}>
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: card.isActive ? '#10b981' : '#ef4444' }} />
                                  {card.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '8px' }}>
                                  <button
                                    type="button"
                                    onClick={() => openDeltaEdit(card)}
                                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(10, 141, 147, 0.08)', border: '1px solid rgba(10, 141, 147, 0.2)', color: '#0A8D93', cursor: 'pointer' }}
                                    title="Edit Card"
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDeltaCard(card._id)}
                                    disabled={deltaCardsList.length <= 5}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '8px',
                                      background: 'rgba(239, 68, 68, 0.08)',
                                      border: '1px solid rgba(239, 68, 68, 0.2)',
                                      color: '#ef4444',
                                      cursor: deltaCardsList.length <= 5 ? 'not-allowed' : 'pointer',
                                      opacity: deltaCardsList.length <= 5 ? 0.4 : 1
                                    }}
                                    title={deltaCardsList.length <= 5 ? "Delete blocked (Minimum 5 cards required)" : "Delete Card"}
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                              No Delta Difference cards found. Click below to add.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
 
                  {deltaCardsList.length < 5 ? (
                    <form onSubmit={handleDeltaSubmit} className={styles.formCard} style={{ marginTop: '16px' }}>
                      <h3 className={styles.sectionTitle}>Add New Delta Difference Card</h3>
                      <div className={styles.grid}>
                        <div className={styles.inputGroup}>
                          <label className={styles.label} htmlFor="new-card-title">Title / Card Header</label>
                          <input
                            id="new-card-title"
                            type="text"
                            placeholder="e.g. Anatomical Models"
                            className={styles.input}
                            value={newCardTitle}
                            onChange={(e) => setNewCardTitle(e.target.value)}
                            required
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label className={styles.label} htmlFor="new-card-category">Category</label>
                          <input
                            id="new-card-category"
                            type="text"
                            placeholder="e.g. Anatomy"
                            className={styles.input}
                            value={newCardCategory}
                            onChange={(e) => setNewCardCategory(e.target.value)}
                            required
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label className={styles.label} htmlFor="new-card-initials">Initials (2 letters)</label>
                          <input
                            id="new-card-initials"
                            type="text"
                            maxLength={2}
                            placeholder="e.g. AM"
                            className={styles.input}
                            value={newCardInitials}
                            onChange={(e) => setNewCardInitials(e.target.value)}
                            required
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label className={styles.label} htmlFor="new-card-order">Display Order</label>
                          <input
                            id="new-card-order"
                            type="number"
                            placeholder="e.g. 1"
                            className={styles.input}
                            value={newCardOrder}
                            onChange={(e) => setNewCardOrder(Number(e.target.value))}
                            required
                          />
                        </div>
                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                          <label className={styles.label} htmlFor="new-card-desc">Description</label>
                          <textarea
                            id="new-card-desc"
                            rows={4}
                            placeholder="Enter card description..."
                            className={styles.input}
                            value={newCardDesc}
                            onChange={(e) => setNewCardDesc(e.target.value)}
                            required
                          />
                        </div>
                        <div className={styles.inputGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                          <input
                            id="new-card-active"
                            type="checkbox"
                            checked={newCardActive}
                            onChange={(e) => setNewCardActive(e.target.checked)}
                          />
                          <label className={styles.label} htmlFor="new-card-active" style={{ margin: 0 }}>Active / Show on homepage</label>
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="ctaButton"
                        style={{ width: '220px', marginTop: '24px', background: 'var(--primary)', border: 'none', padding: '14px', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        {isPending ? 'Creating...' : 'Create Card'}
                      </button>
                    </form>
                  ) : (
                    <div style={{
                      background: 'rgba(10, 141, 147, 0.04)',
                      borderRadius: '16px',
                      border: '1px solid rgba(10, 141, 147, 0.15)',
                      padding: '24px',
                      textAlign: 'center',
                      color: '#475569',
                      fontSize: '0.9rem'
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#0a8d93', marginBottom: '8px' }}>info</span>
                      <p>
                        <strong>Maximum limit of 5 cards reached.</strong> The "Add Card" button is hidden.
                        To add a different card, you must first edit an existing card or delete one (note: deletion is only allowed if count &gt; 5).
                      </p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

        </main>
      </div>
    </div>
  );
}
