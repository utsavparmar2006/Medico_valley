'use client';

import React, { useState, useEffect, useTransition, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getBackendUrl } from '@/utils/api';
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
  keyFeatures?: string[];
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
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'products' | 'manage' | 'categoryDetail' | 'productDetail' | 'inquiries' | 'difference' | 'blogs' | 'clients' | 'sectors'>('overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [categoriesList, setCategoriesList] = useState<CategoryObj[]>([]);
  const [productsList, setProductsList] = useState<ProductObj[]>([]);
  const [inquiriesList, setInquiriesList] = useState<any[]>([]);
  const [inquirySearchQuery, setInquirySearchQuery] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<'All' | 'Pending' | 'Contacted' | 'Quoted' | 'Completed'>('All');
  const [selectedCategory, setSelectedCategory] = useState<CategoryObj | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductObj | null>(null);
  const [detailReturnTab, setDetailReturnTab] = useState<'overview' | 'manage'>('overview');

  const TABS_CONFIG = [
    { id: 'overview', label: 'Dashboard', icon: 'dashboard' },
    { id: 'manage', label: 'Catalog Listings', icon: 'manage_search' },
    { id: 'categories', label: 'New Category', icon: 'category' },
    { id: 'products', label: 'New Product', icon: 'inventory' },
    { id: 'inquiries', label: 'Inquiries', icon: 'mail' },
    { id: 'blogs', label: 'Blogs', icon: 'article' },
    { id: 'clients', label: 'Top Clients', icon: 'group' },
    { id: 'sectors', label: 'Our Sectors', icon: 'domain' }
  ] as const;

  const activeTabId = ['categoryDetail', 'productDetail'].includes(activeTab) ? detailReturnTab : activeTab;
  const activeTabConfig = TABS_CONFIG.find((t) => t.id === activeTabId) || TABS_CONFIG[0];

  const [blogsList, setBlogsList] = useState<any[]>([]);
  const [showConfirmDeleteBlogModal, setShowConfirmDeleteBlogModal] = useState<string | null>(null);

  // Client Management States
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientLocation, setClientLocation] = useState('');
  const [clientTestimonial, setClientTestimonial] = useState('');
  const [clientType, setClientType] = useState('');
  const [clientLogoUrl, setClientLogoUrl] = useState('');
  const [clientDisplayOrder, setClientDisplayOrder] = useState<number>(0);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [showConfirmDeleteClientModal, setShowConfirmDeleteClientModal] = useState<string | null>(null);

  // Sectors / Labs States
  const [sectorsList, setSectorsList] = useState<any[]>([]);
  const [sectorTitle, setSectorTitle] = useState('');
  const [sectorDesc, setSectorDesc] = useState('');
  const [sectorDefaultImg, setSectorDefaultImg] = useState('');
  const [sectorHoverImg, setSectorHoverImg] = useState('');
  const [sectorLinkUrl, setSectorLinkUrl] = useState('/products');
  const [sectorDisplayOrder, setSectorDisplayOrder] = useState<number>(0);
  const [editingSector, setEditingSector] = useState<any | null>(null);
  const [isCreatingSector, setIsCreatingSector] = useState(false);
  const [showConfirmDeleteSectorModal, setShowConfirmDeleteSectorModal] = useState<string | null>(null);
  const [sectorUploadingDefault, setSectorUploadingDefault] = useState(false);
  const [sectorUploadingHover, setSectorUploadingHover] = useState(false);

  // Blog Form States
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSubject, setBlogSubject] = useState('');
  const [blogReadTime, setBlogReadTime] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogImageUrl, setBlogImageUrl] = useState('');
  const [blogContentText, setBlogContentText] = useState('');
  const [blogHighlightsText, setBlogHighlightsText] = useState('');
  const [editingBlog, setEditingBlog] = useState<any | null>(null);

  // Detail editing state
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryDesc, setEditCategoryDesc] = useState('');
  const [editCategoryImage, setEditCategoryImage] = useState('');
  const [editProductName, setEditProductName] = useState('');
  const [editProductDesc, setEditProductDesc] = useState('');
  const [editProductCategoryId, setEditProductCategoryId] = useState('');
  const [editProductMedia, setEditProductMedia] = useState<string[]>([]);
  const [editProductCatalog, setEditProductCatalog] = useState('');
  const [editProductKeyFeatures, setEditProductKeyFeatures] = useState('');

  // Search & Filtering states for Listings Tab
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [manageView, setManageView] = useState<'categories' | 'products'>('products');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & Filtering calculations for Inquiries Tab
  const filteredInquiriesList = inquiriesList.filter((inq) => {
    const query = inquirySearchQuery.toLowerCase().trim();
    const matchesStatus = inquiryStatusFilter === 'All' || inq.status === inquiryStatusFilter;

    if (!query) return matchesStatus;

    const matchesId = inq.inquiryId?.toLowerCase().includes(query);
    const matchesProduct = inq.productName?.toLowerCase().includes(query);
    const matchesCategory = inq.category?.toLowerCase().includes(query);
    const matchesCustomer = inq.customerName?.toLowerCase().includes(query);
    const matchesEmail = inq.email?.toLowerCase().includes(query);
    const matchesPhone = inq.phone?.toLowerCase().includes(query);
    const matchesInstitution = inq.institution?.toLowerCase().includes(query);
    const matchesCity = inq.city?.toLowerCase().includes(query);

    return matchesStatus && (
      matchesId ||
      matchesProduct ||
      matchesCategory ||
      matchesCustomer ||
      matchesEmail ||
      matchesPhone ||
      matchesInstitution ||
      matchesCity
    );
  });

  const inquiryCounts = {
    All: inquiriesList.length,
    Pending: inquiriesList.filter((i) => i.status === 'Pending').length,
    Contacted: inquiriesList.filter((i) => i.status === 'Contacted').length,
    Quoted: inquiriesList.filter((i) => i.status === 'Quoted').length,
    Completed: inquiriesList.filter((i) => i.status === 'Completed').length,
  };

  // Custom Modal States
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState<string | null>(null);
  const [showAlertProductsModal, setShowAlertProductsModal] = useState<{ count: number } | null>(null);
  const [showConfirmDeleteProductModal, setShowConfirmDeleteProductModal] = useState<string | null>(null);

  const [loadingData, setLoadingData] = useState(true);


  // Pagination & Scrolling States
  const [visibleProductsCount, setVisibleProductsCount] = useState(8);
  const [visibleInquiriesCount, setVisibleInquiriesCount] = useState(10);

  const productLoaderRef = useRef<HTMLDivElement | null>(null);
  const inquiryLoaderRef = useRef<HTMLDivElement | null>(null);

  // Reset pagination lists when filters or views change
  useEffect(() => {
    setVisibleProductsCount(8);
    setVisibleInquiriesCount(10);
  }, [searchQuery, selectedCategoryFilter, manageView, activeTab]);

  useEffect(() => {
    const loader = productLoaderRef.current;
    if (!loader) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleProductsCount((prev) => prev + 8);
        }
      },
      { rootMargin: '120px 0px' }
    );
    observer.observe(loader);
    return () => observer.disconnect();
  }, [productsList.length]);

  useEffect(() => {
    const loader = inquiryLoaderRef.current;
    if (!loader) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleInquiriesCount((prev) => prev + 10);
        }
      },
      { rootMargin: '120px 0px' }
    );
    observer.observe(loader);
    return () => observer.disconnect();
  }, [inquiriesList.length]);

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
  const [productKeyFeatures, setProductKeyFeatures] = useState('');

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
    const targetUrl = getBackendUrl(url);
    let token = localStorage.getItem('adminAccessToken');
    const headers = new Headers(options.headers || {});

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    options.headers = headers;

    let response = await fetch(targetUrl, options);

    // If unauthorized, check if it was due to token expiration
    if (response.status === 401) {
      const clone = response.clone();
      const data = await clone.json().catch(() => ({}));

      if (data.tokenExpired) {
        console.log('Access token expired. Refreshing token...');

        try {
          // Send request to token refresh endpoint (automatically shares cookie)
          const refreshRes = await fetch(getBackendUrl('http://localhost:5000/api/admin/refresh'), {
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
            response = await fetch(targetUrl, options);
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

  // Automatically refresh dashboard data in the background on window focus or at short intervals
  useEffect(() => {
    const isEditing = 
      editingClient || 
      editingSector || 
      editingBlog || 
      editingDeltaCard || 
      isCreatingClient || 
      isCreatingSector ||
      selectedCategory ||
      selectedProduct;

    const handleFocus = () => {
      if (!isEditing) {
        loadDashboardData(true);
      }
    };
    window.addEventListener('focus', handleFocus);

    const interval = setInterval(() => {
      if (!isEditing) {
        loadDashboardData(true);
      }
    }, 60000); // Check for updates every 60 seconds (optimized from 15s to prevent input lag and save CPU)

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [
    editingClient,
    editingSector,
    editingBlog,
    editingDeltaCard,
    isCreatingClient,
    isCreatingSector,
    selectedCategory,
    selectedProduct
  ]);

  const loadDashboardData = async (isBackground: boolean = false) => {
    if (!isBackground) {
      setLoadingData(true);
    }
    try {
      // Fetch Categories
      const catRes = await fetch(getBackendUrl('http://localhost:5000/api/public/categories'));
      const catData = await catRes.json();
      if (catRes.ok && catData.success) {
        setCategoriesList(catData.data);
      }

      // Fetch Products
      const prodRes = await fetch(getBackendUrl('http://localhost:5000/api/public/products'));
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

      // Fetch Blogs
      const blogRes = await fetch(getBackendUrl('http://localhost:5000/api/public/blogs'));
      const blogData = await blogRes.json();
      if (blogRes.ok && blogData.success) {
        setBlogsList(blogData.data);
      }

      // Fetch Clients
      const clientRes = await fetch(getBackendUrl(`http://localhost:5000/api/public/clients?t=${Date.now()}`), {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const clientData = await clientRes.json();
      if (clientRes.ok && clientData.success) {
        setClientsList(clientData.data);
      }

      // Fetch Sectors / Labs
      const sectorRes = await fetch(getBackendUrl(`http://localhost:5000/api/public/sectors?t=${Date.now()}`), {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const sectorData = await sectorRes.json();
      if (sectorRes.ok && sectorData.success) {
        setSectorsList(sectorData.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      if (!isBackground) {
        setLoadingData(false);
      }
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

  // Blog Form Submit (Create & Update)
  const handleBlogFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!blogTitle || !blogSubject || !blogReadTime || !blogExcerpt || !blogImageUrl || !blogContentText) {
      setStatusMessage({ type: 'error', text: 'All blog fields except takeaways are required.' });
      return;
    }

    // Split paragraphs by double newline or single newline
    const content = blogContentText
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    // Split highlights/takeaways by line
    const highlights = blogHighlightsText
      .split('\n')
      .map((h) => h.trim())
      .filter((h) => h.length > 0);

    const isNew = editingBlog.isNew;
    const url = isNew
      ? 'http://localhost:5000/api/admin/blogs'
      : `http://localhost:5000/api/admin/blogs/${editingBlog._id}`;
    const method = isNew ? 'POST' : 'PUT';

    startTransition(async () => {
      try {
        const response = await authFetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: blogTitle,
            subject: blogSubject,
            readTime: blogReadTime,
            excerpt: blogExcerpt,
            imageUrl: blogImageUrl,
            content,
            highlights,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatusMessage({
            type: 'success',
            text: isNew ? 'Blog article published successfully!' : 'Blog article updated successfully!',
          });
          setEditingBlog(null);
          await loadDashboardData();
        } else {
          setStatusMessage({ type: 'error', text: data.message || 'Blog operation failed.' });
        }
      } catch (err) {
        setStatusMessage({ type: 'error', text: 'Could not connect to database.' });
      }
    });
  };

  // Confirm Delete Blog
  const confirmDeleteBlog = async (id: string) => {
    setStatusMessage(null);
    setShowConfirmDeleteBlogModal(null);

    startTransition(async () => {
      try {
        const response = await authFetch(`http://localhost:5000/api/admin/blogs/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();

        if (response.ok && data.success) {
          setStatusMessage({ type: 'success', text: 'Blog article deleted successfully.' });
          await loadDashboardData();
        } else {
          setStatusMessage({ type: 'error', text: data.message || 'Failed to delete blog.' });
        }
      } catch (err) {
        setStatusMessage({ type: 'error', text: 'Could not delete blog article.' });
      }
    });
  };

  // Category Submit
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!categoryName || !categoryDesc) {
      setStatusMessage({ type: 'error', text: 'Category Name and Description are required.' });
      return;
    }

    if (!categoryImgUrl) {
      setStatusMessage({ type: 'error', text: 'Category Cover Image is required. Please upload an image.' });
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

    if (!productName || !productDesc || !productCategoryId) {
      setStatusMessage({ type: 'error', text: 'Product Name, Description, and Category are required.' });
      return;
    }

    if (productMediaUrls.length === 0) {
      setStatusMessage({ type: 'error', text: 'Product Media is required. Please upload at least one image or video.' });
      return;
    }

    const keyFeaturesArray = productKeyFeatures
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

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
            keyFeatures: keyFeaturesArray,
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
          setProductKeyFeatures('');
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
    setEditProductKeyFeatures(product.keyFeatures ? product.keyFeatures.join('\n') : '');
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
    if (!selectedProduct) return;

    if (!editProductName || !editProductDesc || !editProductCategoryId) {
      setStatusMessage({ type: 'error', text: 'Product Name, Description, and Category are required.' });
      return;
    }

    if (editProductMedia.length === 0) {
      setStatusMessage({ type: 'error', text: 'Product Media is required. Please upload at least one image or video.' });
      return;
    }

    const keyFeaturesArray = editProductKeyFeatures
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

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
            keyFeatures: keyFeaturesArray,
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
  const handleDeleteProduct = (id: string) => {
    setShowConfirmDeleteProductModal(id);
  };

  const confirmDeleteProduct = async (id: string) => {
    setShowConfirmDeleteProductModal(null);
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Product deletion failed.' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Could not delete product.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      console.log('handleDeleteCategory called for id:', id);
      console.log('productsList:', productsList);

      // Check if there are active products under this category
      const productsInCat = (productsList || []).filter(p => {
        if (!p.category) return false;
        if (typeof p.category === 'string') {
          return p.category === id;
        }
        return p.category._id === id;
      });

      if (productsInCat.length > 0) {
        setShowAlertProductsModal({ count: productsInCat.length });
        return;
      }

      setShowConfirmDeleteModal(id);
    } catch (err: any) {
      console.error('Error in handleDeleteCategory:', err);
      setStatusMessage({ type: 'error', text: 'Error preparing category deletion: ' + err.message });
    }
  };

  const confirmDeleteCategory = async (id: string) => {
    setShowConfirmDeleteModal(null);
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Category deletion failed.' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setStatusMessage({ type: 'error', text: 'Could not delete category: ' + err.message });
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Client CRUD Handlers
  const resetClientForm = () => {
    setClientName('');
    setClientLocation('');
    setClientTestimonial('');
    setClientType('');
    setClientLogoUrl('');
    setClientDisplayOrder(0);
    setEditingClient(null);
    setIsCreatingClient(false);
  };

  const openClientEdit = (client: any) => {
    setEditingClient(client);
    setIsCreatingClient(false);
    setClientName(client.name);
    setClientLocation(client.location);
    setClientTestimonial(client.testimonial);
    setClientType(client.type);
    setClientLogoUrl(client.logoUrl);
    setClientDisplayOrder(client.displayOrder || 0);
    setStatusMessage(null);
    setActiveTab('clients');
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!clientName.trim() || !clientTestimonial.trim() || !clientLogoUrl.trim()) {
      setStatusMessage({ type: 'error', text: 'Client Name, Testimonial Message, and Logo Image are required.' });
      return;
    }

    const payload = {
      name: clientName,
      location: clientLocation,
      testimonial: clientTestimonial,
      type: clientType,
      logoUrl: clientLogoUrl,
      displayOrder: Number(clientDisplayOrder || 0)
    };

    startTransition(async () => {
      try {
        const url = editingClient 
          ? `http://localhost:5000/api/admin/clients/${editingClient._id}`
          : 'http://localhost:5000/api/admin/clients';
        const method = editingClient ? 'PUT' : 'POST';

        const response = await authFetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatusMessage({ 
            type: 'success', 
            text: editingClient ? 'Client updated successfully!' : 'Client added successfully!' 
          });
          resetClientForm();
          await loadDashboardData();
        } else {
          setStatusMessage({ type: 'error', text: data.message || 'Action failed.' });
        }
      } catch (err) {
        setStatusMessage({ type: 'error', text: 'Could not connect to database.' });
      }
    });
  };

  const confirmDeleteClient = async (id: string) => {
    setShowConfirmDeleteClientModal(null);
    setStatusMessage(null);

    try {
      const response = await authFetch(`http://localhost:5000/api/admin/clients/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMessage({ type: 'success', text: 'Client deleted successfully!' });
        await loadDashboardData();
        if (editingClient?._id === id) {
          resetClientForm();
        }
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Deletion failed.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Could not delete client.' });
    }
  };

  // Sector Handler Methods
  const resetSectorForm = () => {
    setEditingSector(null);
    setIsCreatingSector(false);
    setSectorTitle('');
    setSectorDesc('');
    setSectorDefaultImg('');
    setSectorHoverImg('');
    setSectorLinkUrl('/products');
    setSectorDisplayOrder(0);
    setSectorUploadingDefault(false);
    setSectorUploadingHover(false);
  };

  const openSectorEdit = (sector: any) => {
    setEditingSector(sector);
    setSectorTitle(sector.title);
    setSectorDesc(sector.desc);
    setSectorDefaultImg(sector.defaultImg);
    setSectorHoverImg(sector.hoverImg || '');
    setSectorLinkUrl(sector.linkUrl || '/products');
    setSectorDisplayOrder(sector.displayOrder || 0);
    setIsCreatingSector(true);
  };

  const handleFileUploadForSector = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'default' | 'hover'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'default') setSectorUploadingDefault(true);
    else setSectorUploadingHover(true);

    try {
      const url = await handleFileUpload(file);
      if (url) {
        if (type === 'default') setSectorDefaultImg(url);
        else setSectorHoverImg(url);
        setStatusMessage({ type: 'success', text: `${type === 'default' ? 'Default' : 'Hover'} image uploaded successfully!` });
      } else {
        setStatusMessage({ type: 'error', text: 'Image upload failed' });
      }
    } catch (err) {
      console.error('Sector image upload error:', err);
      setStatusMessage({ type: 'error', text: 'Image upload failed' });
    } finally {
      if (type === 'default') setSectorUploadingDefault(false);
      else setSectorUploadingHover(false);
    }
  };

  const handleSaveSector = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!editingSector && sectorsList.length >= 4) {
      setStatusMessage({ type: 'error', text: 'Maximum limit of 4 sector cards reached. Edit or delete an existing card to add a new one.' });
      return;
    }

    if (!sectorTitle.trim()) {
      setStatusMessage({ type: 'error', text: 'Sector title is required.' });
      return;
    }
    if (sectorTitle.length > 40) {
      setStatusMessage({ type: 'error', text: 'Title cannot exceed 40 characters.' });
      return;
    }
    if (!sectorDesc.trim()) {
      setStatusMessage({ type: 'error', text: 'Short description is required.' });
      return;
    }
    if (sectorDesc.length > 180) {
      setStatusMessage({ type: 'error', text: 'Short description cannot exceed 180 characters.' });
      return;
    }
    if (!sectorDefaultImg.trim()) {
      setStatusMessage({ type: 'error', text: 'Default (without hover) image is required.' });
      return;
    }

    const payload = {
      title: sectorTitle.trim(),
      desc: sectorDesc.trim(),
      defaultImg: sectorDefaultImg,
      hoverImg: sectorHoverImg,
      linkUrl: sectorLinkUrl,
      displayOrder: Number(sectorDisplayOrder) || 0,
    };

    const targetUrl = editingSector
      ? `http://localhost:5000/api/admin/sectors/${editingSector._id}`
      : 'http://localhost:5000/api/admin/sectors';
    const method = editingSector ? 'PUT' : 'POST';

    try {
      const response = await authFetch(targetUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: editingSector ? 'Sector updated successfully!' : 'Sector created successfully!',
        });
        resetSectorForm();
        await loadDashboardData();
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Action failed.' });
      }
    } catch (err) {
      console.error('Save sector error:', err);
      setStatusMessage({ type: 'error', text: 'Could not connect to database.' });
    }
  };

  const confirmDeleteSector = async (id: string) => {
    setShowConfirmDeleteSectorModal(null);
    setStatusMessage(null);

    try {
      const response = await authFetch(`http://localhost:5000/api/admin/sectors/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMessage({ type: 'success', text: 'Sector deleted successfully!' });
        await loadDashboardData();
        if (editingSector?._id === id) {
          resetSectorForm();
        }
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Deletion failed.' });
      }
    } catch (err) {
      console.error('Delete sector error:', err);
      setStatusMessage({ type: 'error', text: 'Could not delete sector.' });
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
          <h1>Catalog Management</h1>
          <p>Manage Medico Valley categories, products, and published assets.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <span>Log Out</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
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

          {/* Desktop Sidebar Navigation */}
          <nav className={styles.sidebarNav}>
            {TABS_CONFIG.map((tab) => {
              const isTabActive = activeTab === tab.id || (tab.id === 'overview' && ['categoryDetail', 'productDetail'].includes(activeTab) && detailReturnTab === 'overview') || (tab.id === 'manage' && ['categoryDetail', 'productDetail'].includes(activeTab) && detailReturnTab === 'manage');
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'blogs') setEditingBlog(null);
                    if (tab.id === 'clients') resetClientForm();
                    if (tab.id === 'sectors') resetSectorForm();
                    setStatusMessage(null);
                  }}
                  className={`${styles.navBtn} ${isTabActive ? styles.navBtnActive : ''}`}
                  style={{ position: 'relative' }}
                >
                  {isTabActive && (
                    <motion.div
                      layoutId="sidebarActive"
                      className={styles.navActiveBg}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="material-symbols-outlined" style={{ position: 'relative', zIndex: 2 }}>{tab.icon}</span>
                  <span style={{ position: 'relative', zIndex: 2 }}>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile View Switcher (Unique Glassmorphic Dropdown) */}
          <div className={styles.mobileNavContainer}>
            <button
              type="button"
              className={styles.mobileNavTrigger}
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            >
              <div className={styles.mobileNavTriggerLeft}>
                <span className="material-symbols-outlined">{activeTabConfig.icon}</span>
                <span>{activeTabConfig.label}</span>
              </div>
              <span className="material-symbols-outlined">
                {isMobileNavOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            <AnimatePresence>
              {isMobileNavOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={styles.mobileNavDropdown}
                >
                  {TABS_CONFIG.map((tab) => {
                    const isTabActive = activeTab === tab.id || (tab.id === 'overview' && ['categoryDetail', 'productDetail'].includes(activeTab) && detailReturnTab === 'overview') || (tab.id === 'manage' && ['categoryDetail', 'productDetail'].includes(activeTab) && detailReturnTab === 'manage');
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        className={`${styles.mobileDropdownItem} ${isTabActive ? styles.mobileDropdownItemActive : ''}`}
                        onClick={() => {
                          setActiveTab(tab.id);
                          if (tab.id === 'blogs') setEditingBlog(null);
                          if (tab.id === 'clients') resetClientForm();
                          if (tab.id === 'sectors') resetSectorForm();
                          setStatusMessage(null);
                          setIsMobileNavOpen(false);
                        }}
                      >
                        <span className="material-symbols-outlined">{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
                    <label className={styles.label} htmlFor="edit-product-keyfeatures">Key Features (One feature per line)</label>
                    <textarea id="edit-product-keyfeatures" className={styles.input} rows={4} value={editProductKeyFeatures} onChange={(e) => setEditProductKeyFeatures(e.target.value)} placeholder="Enter each bullet point feature on a new line" />
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
                    <button type="submit" className={styles.primaryButton} disabled={isPending || uploadingFile}>
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
                    placeholder={manageView === 'products' ? "Search products..." : "Search categories..."}
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
                        <>
                          <motion.div layout className={styles.productOverviewGrid} key="prods-grid">
                            <AnimatePresence mode="popLayout">
                              {filteredProds.slice(0, visibleProductsCount).map((prod) => (
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
                          {filteredProds.length > visibleProductsCount && (
                            <div ref={productLoaderRef} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.6)', gap: '8px' }}>
                              <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                              <span>Loading more products...</span>
                            </div>
                          )}
                        </>
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
                  <label className={styles.label} htmlFor="category-name">
                    Category Name <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#64748b' }}>(Max 30 chars)</span>
                  </label>
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
                  <label className={styles.label} htmlFor="category-desc">
                    Description <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#64748b' }}>(Max 120 chars)</span>
                  </label>
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
                  <label className={styles.label}>Category Cover Image *</label>
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
                disabled={isPending || uploadingFile}
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
                  <label className={styles.label} htmlFor="product-name">
                    Product Name <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#64748b' }}>(Max 50 chars)</span>
                  </label>
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
                  <label className={styles.label} htmlFor="product-desc">
                    Description <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#64748b' }}>(Max 300 chars)</span>
                  </label>
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

                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label className={styles.label} htmlFor="product-keyfeatures">
                    Key Features <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#64748b' }}>(Optional - One feature per line)</span>
                  </label>
                  <textarea
                    id="product-keyfeatures"
                    placeholder="Enter each bullet point feature on a new line"
                    className={styles.input}
                    rows={4}
                    value={productKeyFeatures}
                    onChange={(e) => setProductKeyFeatures(e.target.value)}
                  />
                </div>

                {/* Multiple image / video files upload */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Product Media (Images or Videos) *</label>
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
                disabled={isPending || uploadingFile}
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
              {/* Search & Status Filter Toolbar */}
              <div className={styles.inquiryToolbar}>
                {/* Search Input Bar */}
                <div className={styles.inquirySearchBox}>
                  <span className="material-symbols-outlined" style={{ color: '#0a8d93', fontSize: '20px' }}>search</span>
                  <input
                    type="text"
                    placeholder="Search ID, customer, email, phone, product, city..."
                    value={inquirySearchQuery}
                    onChange={(e) => setInquirySearchQuery(e.target.value)}
                    className={styles.inquirySearchInput}
                  />
                  {inquirySearchQuery && (
                    <button
                      type="button"
                      onClick={() => setInquirySearchQuery('')}
                      className={styles.inquirySearchClear}
                      title="Clear search"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                    </button>
                  )}
                </div>

                {/* Status Filter Pills */}
                <div className={styles.inquiryFilterPills}>
                  {(['All', 'Pending', 'Contacted', 'Quoted', 'Completed'] as const).map((statusKey) => {
                    const isActive = inquiryStatusFilter === statusKey;
                    return (
                      <button
                        key={statusKey}
                        type="button"
                        onClick={() => setInquiryStatusFilter(statusKey)}
                        className={`${styles.inquiryFilterPill} ${isActive ? styles.inquiryFilterPillActive : ''}`}
                      >
                        <span>{statusKey}</span>
                        <span className={styles.inquiryFilterCount}>{inquiryCounts[statusKey]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {inquiriesList.length > 0 ? (
                filteredInquiriesList.length > 0 ? (
                  <>
                    {/* Desktop Table View */}
                    <div className={styles.inquiriesTableView}>
                      <div style={{ overflowX: 'auto', width: '100%', marginTop: '8px' }}>
                        <table style={{
                          width: '100%',
                          minWidth: '1000px',
                          borderCollapse: 'collapse',
                          textAlign: 'left',
                          color: '#334155',
                        }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #cbd5e1', color: '#475569', fontSize: '0.85rem' }}>
                              <th style={{ padding: '12px 16px' }}>Inquiry ID</th>
                              <th style={{ padding: '12px 16px' }}>Date</th>
                              <th style={{ padding: '12px 16px' }}>Product</th>
                              <th style={{ padding: '12px 16px' }}>Customer</th>
                              <th style={{ padding: '12px 16px' }}>Institution</th>
                              <th style={{ padding: '12px 16px' }}>City</th>
                              <th style={{ padding: '12px 16px' }}>Contact</th>
                              <th style={{ padding: '12px 16px' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredInquiriesList.slice(0, visibleInquiriesCount).map((inq) => {
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
                                        border: `1px solid ${inq.status === 'Completed' ? 'rgba(16, 185, 129, 0.3)' :
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
                    </div>

                    {/* Mobile Glassmorphic Inquiry Cards View */}
                    <div className={styles.inquiriesMobileView}>
                      {filteredInquiriesList.slice(0, visibleInquiriesCount).map((inq) => {
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
                          <div key={inq._id} className={styles.inquiryCard}>
                            {/* Header: ID + Status */}
                            <div className={styles.inquiryCardHeader}>
                              <span className={styles.inquiryCardId}>{inq.inquiryId}</span>
                              <select
                                value={inq.status}
                                onChange={(e) => handleUpdateInquiryStatus(inq._id, e.target.value)}
                                className={styles.inquiryStatusSelect}
                                style={{
                                  background: inq.status === 'Completed' ? 'rgba(16, 185, 129, 0.15)' :
                                    inq.status === 'Quoted' ? 'rgba(59, 130, 246, 0.15)' :
                                      inq.status === 'Contacted' ? 'rgba(245, 158, 11, 0.15)' :
                                        'rgba(239, 68, 68, 0.15)',
                                  color: inq.status === 'Completed' ? '#10b981' :
                                    inq.status === 'Quoted' ? '#3b82f6' :
                                      inq.status === 'Contacted' ? '#f59e0b' :
                                        '#ef4444',
                                  border: `1px solid ${inq.status === 'Completed' ? 'rgba(16, 185, 129, 0.3)' :
                                      inq.status === 'Quoted' ? 'rgba(59, 130, 246, 0.3)' :
                                        inq.status === 'Contacted' ? 'rgba(245, 158, 11, 0.3)' :
                                          'rgba(239, 68, 68, 0.3)'
                                    }`
                                }}
                              >
                                <option value="Pending" style={{ background: '#0b1f3a', color: '#ef4444' }}>Pending</option>
                                <option value="Contacted" style={{ background: '#0b1f3a', color: '#f59e0b' }}>Contacted</option>
                                <option value="Quoted" style={{ background: '#0b1f3a', color: '#3b82f6' }}>Quoted</option>
                                <option value="Completed" style={{ background: '#0b1f3a', color: '#10b981' }}>Completed</option>
                              </select>
                            </div>

                            {/* Product Details */}
                            <div className={styles.inquiryCardProduct}>
                              <h3 className={styles.inquiryProductName}>{inq.productName}</h3>
                              {inq.category && (
                                <span className={styles.inquiryCategoryBadge}>{inq.category}</span>
                              )}
                            </div>

                            {/* Customer Details Container */}
                            <div className={styles.inquiryCardDetails}>
                              <div className={styles.inquiryDetailItem}>
                                <span className="material-symbols-outlined">person</span>
                                <span>{inq.customerName}</span>
                              </div>
                              <div className={styles.inquiryDetailItem}>
                                <span className="material-symbols-outlined">mail</span>
                                <a href={`mailto:${inq.email}`}>{inq.email}</a>
                              </div>
                              <div className={styles.inquiryDetailItem}>
                                <span className="material-symbols-outlined">call</span>
                                <a href={`tel:${inq.phone}`}>{inq.phone}</a>
                              </div>
                              {(inq.institution || inq.city) && (
                                <div className={styles.inquiryDetailItem}>
                                  <span className="material-symbols-outlined">location_city</span>
                                  <span>{[inq.institution, inq.city].filter(Boolean).join(', ')}</span>
                                </div>
                              )}
                            </div>

                            {/* Footer Timestamp */}
                            <div className={styles.inquiryCardFooter}>
                              <span className="material-symbols-outlined">schedule</span>
                              <span>Received on {dateStr} at {timeStr}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {filteredInquiriesList.length > visibleInquiriesCount && (
                      <div ref={inquiryLoaderRef} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.6)', gap: '8px' }}>
                        <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        <span>Loading more inquiries...</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.emptySearchState}>
                    <span className="material-symbols-outlined" style={{ fontSize: '42px', color: '#0a8d93' }}>search_off</span>
                    <h3 style={{ margin: '8px 0 4px', fontSize: '1.1rem', color: '#0f172a' }}>No inquiries found</h3>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                      No records match "{inquirySearchQuery}" {inquiryStatusFilter !== 'All' ? `with status "${inquiryStatusFilter}"` : ''}.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setInquirySearchQuery('');
                        setInquiryStatusFilter('All');
                      }}
                      className={styles.secondaryButton}
                      style={{ marginTop: '16px', padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      Clear Search &amp; Filters
                    </button>
                  </div>
                )
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
                      minWidth: '850px',
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

          {/* BLOGS TAB */}
          {activeTab === 'blogs' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={styles.formCard}
              style={{ maxWidth: '1000px', width: '100%' }}
            >
              {!editingBlog ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                    <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Blog Articles</h2>
                    <button
                      type="button"
                      className="ctaButton"
                      style={{ background: 'var(--primary)', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                      onClick={() => {
                        setEditingBlog({ isNew: true });
                        setBlogTitle('');
                        setBlogSubject('');
                        setBlogReadTime('');
                        setBlogExcerpt('');
                        setBlogImageUrl('');
                        setBlogContentText('');
                        setBlogHighlightsText('');
                        setStatusMessage(null);
                      }}
                    >
                      + Add Blog Post
                    </button>
                  </div>

                  {blogsList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--primary)', marginBottom: '8px' }}>article</span>
                      <p>No blog articles found. Click "+ Add Blog Post" to publish one.</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', color: '#334155', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #cbd5e1', color: '#475569', fontSize: '0.85rem', textAlign: 'left' }}>
                            <th style={{ padding: '12px 8px' }}>Cover</th>
                            <th style={{ padding: '12px 8px' }}>Title</th>
                            <th style={{ padding: '12px 8px' }}>Subject</th>
                            <th style={{ padding: '12px 8px' }}>Read Time</th>
                            <th style={{ padding: '12px 8px' }}>Publish Date</th>
                            <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {blogsList.map((blog) => (
                            <tr
                              key={blog._id}
                              style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem', transition: 'background 0.2s' }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(10, 141, 147, 0.03)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <td style={{ padding: '12px 8px' }}>
                                <img src={blog.imageUrl} alt={blog.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                              </td>
                              <td style={{ padding: '12px 8px', fontWeight: 600, color: '#0f172a' }}>{blog.title}</td>
                              <td style={{ padding: '12px 8px' }}>
                                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: 'rgba(10, 141, 147, 0.08)', color: '#0A8D93', textTransform: 'capitalize' }}>
                                  {blog.subject.replace('-', ' ')}
                                </span>
                              </td>
                              <td style={{ padding: '12px 8px', color: '#475569' }}>{blog.readTime}</td>
                              <td style={{ padding: '12px 8px', color: '#475569' }}>{new Date(blog.createdAt).toLocaleDateString()}</td>
                              <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingBlog(blog);
                                      setBlogTitle(blog.title);
                                      setBlogSubject(blog.subject);
                                      setBlogReadTime(blog.readTime);
                                      setBlogExcerpt(blog.excerpt);
                                      setBlogImageUrl(blog.imageUrl);
                                      setBlogContentText(blog.content.join('\n\n'));
                                      setBlogHighlightsText(blog.highlights.join('\n'));
                                      setStatusMessage(null);
                                    }}
                                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10, 141, 147, 0.08)', border: '1px solid rgba(10, 141, 147, 0.2)', color: '#0A8D93', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setShowConfirmDeleteBlogModal(blog._id)}
                                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <form onSubmit={handleBlogFormSubmit}>
                  <h2 className={styles.sectionTitle}>{editingBlog.isNew ? 'New Blog Article' : 'Edit Blog Article'}</h2>

                  <div className={styles.grid}>
                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                      <label className={styles.label} htmlFor="blog-title">Article Title</label>
                      <input
                        id="blog-title"
                        type="text"
                        placeholder="e.g. Navigating Advanced Anatomy Classrooms"
                        className={styles.input}
                        value={blogTitle}
                        onChange={(e) => setBlogTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label} htmlFor="blog-subject">Subject/Category</label>
                      <input
                        id="blog-subject"
                        type="text"
                        placeholder="e.g. Anatomy, Simulation, etc."
                        className={styles.input}
                        value={blogSubject}
                        onChange={(e) => setBlogSubject(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label} htmlFor="blog-readtime">Read Time</label>
                      <input
                        id="blog-readtime"
                        type="text"
                        placeholder="e.g. 5 min read"
                        className={styles.input}
                        value={blogReadTime}
                        onChange={(e) => setBlogReadTime(e.target.value)}
                        required
                      />
                    </div>

                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                      <label className={styles.label} htmlFor="blog-excerpt">Excerpt / Short Description</label>
                      <input
                        id="blog-excerpt"
                        type="text"
                        placeholder="A short summary of the blog post to show on listing cards"
                        className={styles.input}
                        value={blogExcerpt}
                        onChange={(e) => setBlogExcerpt(e.target.value)}
                        required
                      />
                    </div>

                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                      <label className={styles.label}>Cover Image</label>
                      <label className={styles.uploadBox}>
                        <svg className={styles.uploadIcon} xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                        <span className={styles.uploadText}>Click to upload Cover Image</span>
                        <span className={styles.uploadSubtext}>Supports JPG, PNG (Max 5MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className={styles.fileInput}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handleFileUpload(file);
                              if (url) setBlogImageUrl(url);
                            }
                          }}
                        />
                      </label>

                      {blogImageUrl && (
                        <div className={styles.previewList}>
                          <div className={styles.previewItem}>
                            <img src={blogImageUrl} alt="Blog Preview" className={styles.previewImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button type="button" className={styles.removePreviewBtn} onClick={() => setBlogImageUrl('')}>✕</button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                      <label className={styles.label} htmlFor="blog-highlights">Key Takeaways (Highlights - One per line)</label>
                      <textarea
                        id="blog-highlights"
                        placeholder="Highlight point 1&#10;Highlight point 2&#10;Highlight point 3"
                        className={styles.input}
                        style={{ minHeight: '100px' }}
                        value={blogHighlightsText}
                        onChange={(e) => setBlogHighlightsText(e.target.value)}
                      />
                    </div>

                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                      <label className={styles.label} htmlFor="blog-content">Article Content (One paragraph per line or double newline)</label>
                      <textarea
                        id="blog-content"
                        placeholder="Write your article paragraphs here. Start a new paragraph by hitting enter twice."
                        className={styles.input}
                        style={{ minHeight: '250px' }}
                        value={blogContentText}
                        onChange={(e) => setBlogContentText(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button
                      type="submit"
                      disabled={isPending || uploadingFile}
                      className="ctaButton"
                      style={{ width: '200px', background: 'var(--primary)', border: 'none', padding: '14px', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      {editingBlog.isNew ? 'Publish Article' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingBlog(null)}
                      style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#94A3B8', padding: '14px', borderRadius: '8px', width: '120px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}

          {activeTab === 'clients' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className={styles.dashboardListSection}
            >
              <div className={styles.listSectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <h2 className={styles.listSectionTitle} style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ color: '#0a8d93' }}>group</span>
                    <span>Top Clients Management</span>
                  </h2>
                  <p style={{ color: '#475569', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                    Configure the clients and institution testimonials displayed on the home page.
                  </p>
                </div>
                {!isCreatingClient && !editingClient && (
                  <button
                    type="button"
                    onClick={() => { resetClientForm(); setIsCreatingClient(true); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#0a8d93',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(10, 141, 147, 0.25)',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                    Add Client Logo
                  </button>
                )}
              </div>

              {/* Edit / Create Form */}
              {(isCreatingClient || editingClient) ? (
                <form onSubmit={handleClientSubmit} style={{ background: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#0a8d93', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px', margin: 0 }}>
                    {editingClient ? `Edit Client: ${editingClient.name}` : 'Create New Client Logo'}
                  </h3>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '6px' }} htmlFor="client-name">
                      Client / Institution Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      id="client-name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Bharati Vidyapeeth University"
                      required
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontWeight: '500' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '6px' }} htmlFor="client-testimonial">
                      Message (Testimonial Quote) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea
                      id="client-testimonial"
                      rows={4}
                      value={clientTestimonial}
                      onChange={(e) => setClientTestimonial(e.target.value)}
                      placeholder="e.g. Medico Valley's advanced simulators have significantly enhanced our clinical training programs..."
                      required
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontFamily: 'inherit', fontWeight: '500' }}
                    />
                  </div>

                  {/* Logo Image Upload */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                      Client Logo Image <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '8px' }}>
                      {clientLogoUrl ? (
                        <div style={{ width: '120px', height: '60px', position: 'relative', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                          <img
                            src={clientLogoUrl}
                            alt="Logo preview"
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          />
                        </div>
                      ) : (
                        <div style={{ width: '120px', height: '60px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-symbols-outlined" style={{ color: '#0a8d93' }}>image</span>
                        </div>
                      )}
                      
                      <label style={{ background: '#f1f5f9', color: '#0a8d93', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload</span>
                        Upload Logo File
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handleFileUpload(file);
                              if (url) setClientLogoUrl(url);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button
                      type="submit"
                      disabled={isPending || uploadingFile}
                      style={{ background: '#0a8d93', color: '#ffffff', border: 'none', padding: '12px 28px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 8px rgba(10, 141, 147, 0.25)' }}
                    >
                      {isPending ? 'Saving...' : 'Save Client'}
                    </button>
                    <button
                      type="button"
                      onClick={resetClientForm}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* Client Grid List */
                <div>
                  {clientsList.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                      {clientsList.map((client) => (
                        <div
                          key={client._id}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '16px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '16px',
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ width: '80px', height: '54px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
                              <img
                                src={client.logoUrl}
                                alt={client.name}
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#0f172a', margin: 0, lineHeight: '1.3' }}>
                                {client.name}
                              </h4>
                            </div>
                          </div>

                          <div style={{ background: '#f0fdfa', borderLeft: '3px solid #0a8d93', padding: '12px 16px', borderRadius: '8px' }}>
                            <p style={{ fontSize: '0.88rem', color: '#334155', fontStyle: 'italic', margin: 0, lineHeight: '1.5' }}>
                              "{client.testimonial}"
                            </p>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '14px', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => openClientEdit(client)}
                              style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '8px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowConfirmDeleteClientModal(client._id)}
                              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '8px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyState} style={{ padding: '60px 0', background: '#ffffff', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#0a8d93', marginBottom: '12px' }}>group</span>
                      <p style={{ color: '#475569', fontWeight: '500' }}>No clients found in the database. Add your first client logo to populate the home page.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ========================================== */}
          {/* OUR SECTORS / LABS MANAGEMENT TAB          */}
          {/* ========================================== */}
          {activeTab === 'sectors' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={styles.tabContent}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                    Our Sectors (Lab Cards)
                  </h2>
                  <p style={{ fontSize: '0.88rem', color: '#475569', margin: '4px 0 0 0' }}>
                    Manage the sector lab cards displayed under "Our Sectors" on the home page (Maximum 4 cards limit).
                  </p>
                </div>
                {!isCreatingSector && (
                  sectorsList.length >= 4 ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        padding: '10px 18px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#0a8d93' }}>lock</span>
                      Max 4 Cards Reached ({sectorsList.length}/4)
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { resetSectorForm(); setIsCreatingSector(true); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#0a8d93',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px 18px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(10, 141, 147, 0.25)',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                      Add New Sector ({sectorsList.length}/4)
                    </button>
                  )
                )}
              </div>

              {isCreatingSector ? (
                /* Sector Form */
                <form onSubmit={handleSaveSector} style={{ background: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0a8d93', margin: 0 }}>
                    {editingSector ? 'Edit Sector Card' : 'Create New Sector Card'}
                  </h3>

                  {/* Title field with max 40 chars limit counter */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b' }}>
                        Sector Title <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <span style={{ fontSize: '0.75rem', color: sectorTitle.length > 40 ? '#ef4444' : '#0a8d93', fontWeight: 'bold' }}>
                        {sectorTitle.length} / 40 chars
                      </span>
                    </div>
                    <input
                      type="text"

                      value={sectorTitle}
                      onChange={(e) => setSectorTitle(e.target.value)}
                      placeholder="e.g. Anatomy Lab"
                      required
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontWeight: '500' }}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                      Tip: Keep title concise (max 40 characters) to preserve card layout.
                    </p>
                  </div>

                  {/* Short Description with max 180 chars limit counter */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b' }}>
                        Short Description <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <span style={{ fontSize: '0.75rem', color: sectorDesc.length > 180 ? '#ef4444' : '#0a8d93', fontWeight: 'bold' }}>
                        {sectorDesc.length} / 180 chars
                      </span>
                    </div>
                    <textarea

                      rows={3}
                      value={sectorDesc}
                      onChange={(e) => setSectorDesc(e.target.value)}
                      placeholder="Short description shown when users hover over the card..."
                      required
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontFamily: 'inherit', fontWeight: '500' }}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                      Tip: Maximum 180 characters so the description fits inside the card hover overlay cleanly.
                    </p>
                  </div>

                  {/* Image 1: Default / Without Hover */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                      Default Image (Without Hover) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={sectorDefaultImg}
                        onChange={(e) => setSectorDefaultImg(e.target.value)}
                        placeholder="Image URL or upload file..."
                        required
                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a' }}
                      />
                      <label style={{ background: '#f1f5f9', color: '#0a8d93', border: '1px solid #cbd5e1', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {sectorUploadingDefault ? 'Uploading...' : 'Upload File'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUploadForSector(e, 'default')}
                          disabled={sectorUploadingDefault}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Image 2: Hover State */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                      Hover Image (With Hover) <span style={{ fontSize: '0.75rem', color: '#64748b' }}>(Optional — defaults to standard image if left empty)</span>
                    </label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={sectorHoverImg}
                        onChange={(e) => setSectorHoverImg(e.target.value)}
                        placeholder="Hover image URL or upload file..."
                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a' }}
                      />
                      <label style={{ background: '#f1f5f9', color: '#0a8d93', border: '1px solid #cbd5e1', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {sectorUploadingHover ? 'Uploading...' : 'Upload File'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUploadForSector(e, 'hover')}
                          disabled={sectorUploadingHover}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Display Order */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={sectorDisplayOrder}
                      onChange={(e) => setSectorDisplayOrder(Number(e.target.value))}
                      placeholder="0"
                      style={{ width: '140px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a' }}
                    />
                  </div>

                  {/* Submit & Cancel Buttons */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button
                      type="submit"
                      style={{ background: '#0a8d93', color: '#ffffff', border: 'none', padding: '12px 28px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 8px rgba(10, 141, 147, 0.25)' }}
                    >
                      {editingSector ? 'Update Sector' : 'Save Sector'}
                    </button>
                    <button
                      type="button"
                      onClick={resetSectorForm}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* Sector Cards Grid List */
                <div>
                  {sectorsList.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                      {sectorsList.map((sector) => (
                        <div
                          key={sector._id}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '16px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            position: 'relative'
                          }}
                        >
                          {/* Image preview box */}
                          <div style={{ position: 'relative', height: '180px', background: '#0f172a', overflow: 'hidden' }}>
                            <img
                              src={sector.defaultImg}
                              alt={sector.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(10, 141, 147, 0.95)', padding: '4px 10px', borderRadius: '20px', color: '#ffffff', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              Order: {sector.displayOrder}
                            </div>
                          </div>

                          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', margin: 0, whiteSpace: 'pre-line' }}>
                              {sector.title}
                            </h4>
                            <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                              {sector.desc}
                            </p>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid #e2e8f0', padding: '14px 20px', gap: '8px', background: '#f8fafc' }}>
                            <button
                              type="button"
                              onClick={() => openSectorEdit(sector)}
                              style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '8px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowConfirmDeleteSectorModal(sector._id)}
                              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '8px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyState} style={{ padding: '60px 0', background: '#ffffff', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#0a8d93', marginBottom: '12px' }}>domain</span>
                      <p style={{ color: '#475569', fontWeight: '500' }}>No sectors found in database. Default 4 sectors are currently rendering on the home page.</p>
                      <button
                        type="button"
                        onClick={() => { resetSectorForm(); setIsCreatingSector(true); }}
                        style={{ marginTop: '16px', background: '#0a8d93', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Add Your First Sector
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

        </main>
      </div>

      {/* Custom Modal for deletion blocked (has active products) */}
      <AnimatePresence>
        {showAlertProductsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(5, 11, 20, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              style={{
                background: 'linear-gradient(135deg, #0b1f3a 0%, #050b14 100%)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(239, 68, 68, 0.1)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '480px',
                padding: '32px',
                textAlign: 'center',
                color: '#E2E8F0'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#ef4444', marginBottom: '16px' }}>warning</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px', color: '#fca5a5', fontFamily: 'var(--font-sans)' }}>Deletion Blocked</h3>
              <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: '1.6', marginBottom: '24px', fontFamily: 'var(--font-sans)' }}>
                Cannot delete this category because it contains <strong>{showAlertProductsModal.count}</strong> active product(s).
                Please delete or reassign all products under this category first.
              </p>
              <button
                type="button"
                onClick={() => setShowAlertProductsModal(null)}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  width: '100%',
                  fontFamily: 'var(--font-sans)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#fca5a5'; }}
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Modal for confirm deletion (empty category) */}
      <AnimatePresence>
        {showConfirmDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(5, 11, 20, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              style={{
                background: 'linear-gradient(135deg, #0b1f3a 0%, #050b14 100%)',
                border: '1px solid rgba(15, 111, 255, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(15, 111, 255, 0.1)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '480px',
                padding: '32px',
                textAlign: 'center',
                color: '#E2E8F0'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#49D3E7', marginBottom: '16px' }}>help</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px', color: '#49D3E7', fontFamily: 'var(--font-sans)' }}>Confirm Deletion</h3>
              <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: '1.6', marginBottom: '28px', fontFamily: 'var(--font-sans)' }}>
                Are you sure you want to delete this category? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowConfirmDeleteModal(null)}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#94A3B8',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'var(--font-sans)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => confirmDeleteCategory(showConfirmDeleteModal)}
                  style={{
                    flex: 1,
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'var(--font-sans)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#fca5a5'; }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Modal for confirm product deletion */}
      <AnimatePresence>
        {showConfirmDeleteProductModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(5, 11, 20, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              style={{
                background: 'linear-gradient(135deg, #0b1f3a 0%, #050b14 100%)',
                border: '1px solid rgba(15, 111, 255, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(15, 111, 255, 0.1)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '480px',
                padding: '32px',
                textAlign: 'center',
                color: '#E2E8F0'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#49D3E7', marginBottom: '16px' }}>help</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px', color: '#49D3E7', fontFamily: 'var(--font-sans)' }}>Confirm Deletion</h3>
              <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: '1.6', marginBottom: '28px', fontFamily: 'var(--font-sans)' }}>
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowConfirmDeleteProductModal(null)}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#94A3B8',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'var(--font-sans)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => confirmDeleteProduct(showConfirmDeleteProductModal)}
                  style={{
                    flex: 1,
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'var(--font-sans)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#fca5a5'; }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Modal for confirm blog deletion */}
      <AnimatePresence>
        {showConfirmDeleteBlogModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(5, 11, 20, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              style={{
                background: 'linear-gradient(135deg, #0b1f3a 0%, #050b14 100%)',
                border: '1px solid rgba(15, 111, 255, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(15, 111, 255, 0.1)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '480px',
                padding: '32px',
                textAlign: 'center',
                color: '#E2E8F0'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#49D3E7', marginBottom: '16px' }}>help</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px', color: '#49D3E7', fontFamily: 'var(--font-sans)' }}>Confirm Deletion</h3>
              <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: '1.6', marginBottom: '28px', fontFamily: 'var(--font-sans)' }}>
                Are you sure you want to delete this blog article? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowConfirmDeleteBlogModal(null)}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#94A3B8',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'var(--font-sans)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => confirmDeleteBlog(showConfirmDeleteBlogModal)}
                  style={{
                    flex: 1,
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'var(--font-sans)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#fca5a5'; }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Modal for confirm client deletion */}
      <AnimatePresence>
        {showConfirmDeleteClientModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(5, 11, 20, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              style={{
                background: 'linear-gradient(135deg, #0b1f3a 0%, #050b14 100%)',
                border: '1px solid rgba(15, 111, 255, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(15, 111, 255, 0.1)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '480px',
                padding: '32px',
                textAlign: 'center',
                color: '#E2E8F0'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#49D3E7', marginBottom: '16px' }}>help</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px', color: '#49D3E7', fontFamily: 'var(--font-sans)' }}>Confirm Deletion</h3>
              <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: '1.6', marginBottom: '28px', fontFamily: 'var(--font-sans)' }}>
                Are you sure you want to remove this client? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowConfirmDeleteClientModal(null)}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#94A3B8',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'var(--font-sans)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => confirmDeleteClient(showConfirmDeleteClientModal)}
                  style={{
                    flex: 1,
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'var(--font-sans)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#fca5a5'; }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Modal for confirm sector deletion */}
      <AnimatePresence>
        {showConfirmDeleteSectorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(5, 11, 20, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              style={{
                background: 'linear-gradient(135deg, #0b1f3a 0%, #050b14 100%)',
                border: '1px solid rgba(15, 111, 255, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(15, 111, 255, 0.1)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '480px',
                padding: '32px',
                textAlign: 'center',
                color: '#E2E8F0'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#49D3E7', marginBottom: '16px' }}>help</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px', color: '#49D3E7', fontFamily: 'var(--font-sans)' }}>Confirm Deletion</h3>
              <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: '1.6', marginBottom: '28px', fontFamily: 'var(--font-sans)' }}>
                Are you sure you want to remove this sector card? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowConfirmDeleteSectorModal(null)}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#94A3B8',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'var(--font-sans)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => confirmDeleteSector(showConfirmDeleteSectorModal)}
                  style={{
                    flex: 1,
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'var(--font-sans)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#fca5a5'; }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

