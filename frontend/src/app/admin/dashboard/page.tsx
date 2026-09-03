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
  heroBannerUrl?: string;
}

interface SubcategoryObj {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  heroBannerUrl?: string;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
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
  subcategory?: {
    _id: string;
    name: string;
    slug: string;
  };
  mediaUrls: string[];
  catalogUrl?: string;
  keyFeatures?: string[];
  displayOrder?: number;
  ratingMode?: 'manual' | 'auto';
  manualRating?: number;
  manualRatingCount?: number;
  autoRatingAverage?: number;
  autoRatingCount?: number;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'subcategories' | 'products' | 'manage' | 'categoryDetail' | 'productDetail' | 'inquiries' | 'difference' | 'blogs' | 'clients' | 'sectors' | 'solutions' | 'spotlight'>('overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [categoriesList, setCategoriesList] = useState<CategoryObj[]>([]);
  const [subcategoriesList, setSubcategoriesList] = useState<SubcategoryObj[]>([]);
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
    { id: 'solutions', label: 'Tailored Solutions', icon: 'grid_view' },
    { id: 'spotlight', label: 'Product Spotlight', icon: 'stars' },
    { id: 'categories', label: 'New Category', icon: 'category' },
    { id: 'subcategories', label: 'New Subcategory', icon: 'account_tree' },
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



  // Tailored Solutions States
  const [solutionsList, setSolutionsList] = useState<any[]>([]);
  const [solutionTitle, setSolutionTitle] = useState('');
  const [solutionCategory, setSolutionCategory] = useState('');
  const [solutionDesc, setSolutionDesc] = useState('');
  const [solutionInitials, setSolutionInitials] = useState('');
  const [solutionCtaText, setSolutionCtaText] = useState('');
  const [solutionHref, setSolutionHref] = useState('');
  const [solutionImgUrl, setSolutionImgUrl] = useState('');
  const [solutionDisplayOrder, setSolutionDisplayOrder] = useState<number>(0);
  const [solutionIsActive, setSolutionIsActive] = useState<boolean>(true);
  const [editingSolution, setEditingSolution] = useState<any | null>(null);
  const [isCreatingSolution, setIsCreatingSolution] = useState(false);
  const [showConfirmDeleteSolutionModal, setShowConfirmDeleteSolutionModal] = useState<string | null>(null);

  // Featured Product Spotlight States
  const [spotlightList, setSpotlightList] = useState<any[]>([]);
  const [isCreatingSpotlight, setIsCreatingSpotlight] = useState(false);
  const [editingSpotlight, setEditingSpotlight] = useState<any | null>(null);
  const [showConfirmDeleteSpotlightModal, setShowConfirmDeleteSpotlightModal] = useState<string | null>(null);
  const [spotIsActive, setSpotIsActive] = useState(true);
  const [spotBadge, setSpotBadge] = useState('Featured Product');
  const [spotTitle, setSpotTitle] = useState('');
  const [spotSubtitle, setSpotSubtitle] = useState('');
  const [spotDescription, setSpotDescription] = useState('');
  const [spotImageUrl, setSpotImageUrl] = useState('');
  const [spotFeaturesText, setSpotFeaturesText] = useState('');
  const [spotShowPrimary, setSpotShowPrimary] = useState(true);
  const [spotPrimaryText, setSpotPrimaryText] = useState('View Product');
  const [spotPrimaryHref, setSpotPrimaryHref] = useState('/products');
  const [spotShowSecondary, setSpotShowSecondary] = useState(true);
  const [spotSecondaryText, setSpotSecondaryText] = useState('Download Catalogue');
  const [spotSecondaryHref, setSpotSecondaryHref] = useState('');
  const [spotShowQuote, setSpotShowQuote] = useState(true);
  const [spotQuoteText, setSpotQuoteText] = useState('Request a Quote');
  const [spotDisplayOrder, setSpotDisplayOrder] = useState<number>(0);
  const [selectedCatalogProductId, setSelectedCatalogProductId] = useState<string>('');

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
  const [editCategoryHeroBanner, setEditCategoryHeroBanner] = useState('');
  const [editProductName, setEditProductName] = useState('');
  const [editProductDesc, setEditProductDesc] = useState('');
  const [editProductCategoryId, setEditProductCategoryId] = useState('');
  const [editProductSubcategoryId, setEditProductSubcategoryId] = useState('');
  const [editProductMedia, setEditProductMedia] = useState<string[]>([]);
  const [editProductCatalog, setEditProductCatalog] = useState('');
  const [editProductKeyFeatures, setEditProductKeyFeatures] = useState('');
  const [editProductDisplayOrder, setEditProductDisplayOrder] = useState<number>(0);
  const [editProductRatingMode, setEditProductRatingMode] = useState<'manual' | 'auto'>('manual');
  const [editProductManualRating, setEditProductManualRating] = useState<number>(5.0);
  const [editProductManualRatingCount, setEditProductManualRatingCount] = useState<number>(25);
  const [editProductAutoAvg, setEditProductAutoAvg] = useState<number>(5.0);
  const [editProductAutoCount, setEditProductAutoCount] = useState<number>(0);

  // Subcategory Editing & Deleting States
  const [editingSubcategory, setEditingSubcategory] = useState<SubcategoryObj | null>(null);
  const [editSubCategoryName, setEditSubCategoryName] = useState('');
  const [editSubCategoryCategoryId, setEditSubCategoryCategoryId] = useState('');
  const [editSubCategoryDesc, setEditSubCategoryDesc] = useState('');
  const [editSubCategoryImgUrl, setEditSubCategoryImgUrl] = useState('');
  const [editSubCategoryHeroBannerUrl, setEditSubCategoryHeroBannerUrl] = useState('');
  const [showConfirmDeleteSubcategoryModal, setShowConfirmDeleteSubcategoryModal] = useState<string | null>(null);

  // Search & Filtering states for Listings Tab
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState('');
  const [manageView, setManageView] = useState<'products' | 'categories' | 'subcategories'>('products');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto-dismiss floating status notification toast after 4.5 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

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
    setVisibleProductsCount(24);
    setVisibleInquiriesCount(10);
  }, [searchQuery, selectedCategoryFilter, manageView, activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      const loader = productLoaderRef.current;
      if (!loader) return;
      const rect = loader.getBoundingClientRect();
      if (rect.top <= window.innerHeight + 400) {
        setVisibleProductsCount((prev) => {
          if (prev < productsList.length) {
            return Math.min(prev + 16, productsList.length);
          }
          return prev;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    const loader = productLoaderRef.current;
    if (!loader) return () => window.removeEventListener('scroll', handleScroll);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleProductsCount((prev) => {
            if (prev < productsList.length) {
              return Math.min(prev + 16, productsList.length);
            }
            return prev;
          });
        }
      },
      { rootMargin: '400px 0px' }
    );

    observer.observe(loader);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [visibleProductsCount, productsList.length]);

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
  const [categoryHeroBannerUrl, setCategoryHeroBannerUrl] = useState('');

  // Form State: Subcategories
  const [subCategoryName, setSubCategoryName] = useState('');
  const [subCategoryCategoryId, setSubCategoryCategoryId] = useState('');
  const [subCategoryDesc, setSubCategoryDesc] = useState('');
  const [subCategoryImgUrl, setSubCategoryImgUrl] = useState('');
  const [subCategoryHeroBannerUrl, setSubCategoryHeroBannerUrl] = useState('');

  // Form State: Products
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productCategoryId, setProductCategoryId] = useState('');
  const [productSubcategoryId, setProductSubcategoryId] = useState('');
  const [productMediaUrls, setProductMediaUrls] = useState<string[]>([]);
  const [productCatalogUrl, setProductCatalogUrl] = useState('');
  const [productKeyFeatures, setProductKeyFeatures] = useState('');
  const [productDisplayOrder, setProductDisplayOrder] = useState<number>(0);
  const [productRatingMode, setProductRatingMode] = useState<'manual' | 'auto'>('manual');
  const [productManualRating, setProductManualRating] = useState<number>(5.0);
  const [productManualRatingCount, setProductManualRatingCount] = useState<number>(25);

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
          const refreshRes = await fetch(getBackendUrl('http://localhost:5001/api/admin/refresh'), {
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
      const catRes = await fetch(getBackendUrl('http://localhost:5001/api/public/categories'));
      const catData = await catRes.json();
      if (catRes.ok && catData.success) {
        setCategoriesList(catData.data);
      }

      // Fetch Subcategories
      const subRes = await authFetch('http://localhost:5001/api/admin/subcategories');
      const subData = await subRes.json();
      if (subRes.ok && subData.success) {
        setSubcategoriesList(subData.data);
      }

      // Fetch Products
      const prodRes = await fetch(getBackendUrl('http://localhost:5001/api/public/products'));
      const prodData = await prodRes.json();
      if (prodRes.ok && prodData.success) {
        setProductsList(prodData.data);
      }

      // Fetch Inquiries (protected)
      const inqRes = await authFetch('http://localhost:5001/api/admin/inquiries');
      const inqData = await inqRes.json();
      if (inqRes.ok && inqData.success) {
        setInquiriesList(inqData.data);
      }

      // Fetch Delta Difference cards (protected)
      const deltaRes = await authFetch('http://localhost:5001/api/admin/delta-difference');
      const deltaData = await deltaRes.json();
      if (deltaRes.ok && deltaData.success) {
        setDeltaCardsList(deltaData.data);
      }

      // Fetch Blogs
      const blogRes = await fetch(getBackendUrl('http://localhost:5001/api/public/blogs'));
      const blogData = await blogRes.json();
      if (blogRes.ok && blogData.success) {
        setBlogsList(blogData.data);
      }

      // Fetch Clients
      const clientRes = await fetch(getBackendUrl(`http://localhost:5001/api/public/clients?t=${Date.now()}`), {
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
      const sectorRes = await fetch(getBackendUrl(`http://localhost:5001/api/public/sectors?t=${Date.now()}`), {
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



      // Fetch Tailored Solutions
      const solutionRes = await authFetch('http://localhost:5001/api/admin/solutions');
      const solutionData = await solutionRes.json();
      if (solutionRes.ok && solutionData.success) {
        setSolutionsList(solutionData.data);
      }

      // Fetch Featured Spotlight
      const spotlightRes = await authFetch('http://localhost:5001/api/admin/spotlight');
      const spotlightData = await spotlightRes.json();
      if (spotlightRes.ok && spotlightData.success) {
        setSpotlightList(spotlightData.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      if (!isBackground) {
        setLoadingData(false);
      }
    }
  };



  // General single-file uploader calling Multer upload to AWS S3 with real progress
  const handleFileUpload = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      setUploadingFile(true);
      setUploadProgress(15);
      setStatusMessage(null);

      const formData = new FormData();
      formData.append('file', file);

      const targetUrl = getBackendUrl('http://localhost:5001/api/admin/upload');
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminAccessToken') : null;

      const xhr = new XMLHttpRequest();
      xhr.open('POST', targetUrl);

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 90);
          setUploadProgress(Math.max(15, Math.min(90, percent)));
        }
      };

      xhr.onload = () => {
        setUploadProgress(100);
        setTimeout(() => {
          setUploadingFile(false);
          setUploadProgress(0);
        }, 500);

        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && data.success) {
            resolve(data.url);
          } else {
            setStatusMessage({ type: 'error', text: data.message || 'File upload failed.' });
            resolve(null);
          }
        } catch {
          setStatusMessage({ type: 'error', text: 'Invalid response from upload server.' });
          resolve(null);
        }
      };

      xhr.onerror = () => {
        setUploadingFile(false);
        setUploadProgress(0);
        setStatusMessage({ type: 'error', text: 'Network error occurred during file upload.' });
        resolve(null);
      };

      xhr.send(formData);
    });
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
      ? 'http://localhost:5001/api/admin/blogs'
      : `http://localhost:5001/api/admin/blogs/${editingBlog._id}`;
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
        const response = await authFetch(`http://localhost:5001/api/admin/blogs/${id}`, {
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
        const response = await authFetch('http://localhost:5001/api/admin/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: categoryName,
            description: categoryDesc,
            imageUrl: categoryImgUrl,
            heroBannerUrl: categoryHeroBannerUrl,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatusMessage({ type: 'success', text: 'Category created successfully!' });
          setCategoryName('');
          setCategoryDesc('');
          setCategoryImgUrl('');
          setCategoryHeroBannerUrl('');
          loadDashboardData();
          setActiveTab('overview');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setStatusMessage({ type: 'error', text: data.message || 'Category creation failed.' });
        }
      } catch (err) {
        setStatusMessage({ type: 'error', text: 'Could not connect to database.' });
      }
    });
  };

  // Subcategory Submit
  const handleSubCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!subCategoryName.trim() || !subCategoryCategoryId) {
      setStatusMessage({ type: 'error', text: 'Subcategory Name and Parent Category are required.' });
      return;
    }

    startTransition(async () => {
      try {
        const response = await authFetch('http://localhost:5001/api/admin/subcategories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: subCategoryName,
            categoryId: subCategoryCategoryId,
            description: subCategoryDesc,
            imageUrl: subCategoryImgUrl,
            heroBannerUrl: subCategoryHeroBannerUrl,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatusMessage({ type: 'success', text: 'Subcategory created successfully!' });
          setSubCategoryName('');
          setSubCategoryCategoryId('');
          setSubCategoryDesc('');
          setSubCategoryImgUrl('');
          setSubCategoryHeroBannerUrl('');
          loadDashboardData();
          setActiveTab('overview');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setStatusMessage({ type: 'error', text: data.message || 'Subcategory creation failed.' });
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
        const response = await authFetch('http://localhost:5001/api/admin/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: productName,
            description: productDesc,
            categoryId: productCategoryId,
            subcategoryId: productSubcategoryId || undefined,
            mediaUrls: productMediaUrls,
            catalogUrl: productCatalogUrl || undefined,
            keyFeatures: keyFeaturesArray,
            displayOrder: Number(productDisplayOrder) || 0,
            ratingMode: productRatingMode,
            manualRating: productManualRating,
            manualRatingCount: productManualRatingCount,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatusMessage({ type: 'success', text: 'Product created successfully!' });
          setProductName('');
          setProductDesc('');
          setProductCategoryId('');
          setProductSubcategoryId('');
          setProductMediaUrls([]);
          setProductCatalogUrl('');
          setProductKeyFeatures('');
          setProductDisplayOrder(0);
          setProductRatingMode('manual');
          setProductManualRating(5.0);
          setProductManualRatingCount(25);
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
    setEditCategoryHeroBanner(category.heroBannerUrl || '');
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
    const subId = typeof product.subcategory === 'object' ? product.subcategory?._id : (typeof product.subcategory === 'string' ? product.subcategory : '');
    setEditProductSubcategoryId(subId || '');
    setEditProductMedia(product.mediaUrls);
    setEditProductCatalog(product.catalogUrl || '');
    setEditProductKeyFeatures(product.keyFeatures ? product.keyFeatures.join('\n') : '');
    setEditProductDisplayOrder(typeof product.displayOrder === 'number' ? product.displayOrder : 0);
    setEditProductRatingMode(product.ratingMode || 'manual');
    setEditProductManualRating(typeof product.manualRating === 'number' ? product.manualRating : 5.0);
    setEditProductManualRatingCount(typeof product.manualRatingCount === 'number' ? product.manualRatingCount : 25);
    setEditProductAutoAvg(typeof product.autoRatingAverage === 'number' ? product.autoRatingAverage : 5.0);
    setEditProductAutoCount(typeof product.autoRatingCount === 'number' ? product.autoRatingCount : 0);
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
        const response = await authFetch(`http://localhost:5001/api/admin/categories/${selectedCategory._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editCategoryName,
            description: editCategoryDesc,
            imageUrl: editCategoryImage,
            heroBannerUrl: editCategoryHeroBanner,
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
        const response = await authFetch(`http://localhost:5001/api/admin/products/${selectedProduct._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editProductName,
            description: editProductDesc,
            categoryId: editProductCategoryId,
            subcategoryId: editProductSubcategoryId || null,
            mediaUrls: editProductMedia,
            catalogUrl: editProductCatalog || undefined,
            keyFeatures: keyFeaturesArray,
            displayOrder: Number(editProductDisplayOrder) || 0,
            ratingMode: editProductRatingMode,
            manualRating: editProductManualRating,
            manualRatingCount: editProductManualRatingCount,
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
      const response = await authFetch(`http://localhost:5001/api/admin/products/${id}`, {
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

  // Subcategory Edit & Delete Handlers
  const openSubCategoryEdit = (sub: SubcategoryObj) => {
    setEditingSubcategory(sub);
    setEditSubCategoryName(sub.name);
    const parentId = typeof sub.category === 'object' ? sub.category?._id : sub.category;
    setEditSubCategoryCategoryId(parentId || '');
    setEditSubCategoryDesc(sub.description || '');
    setEditSubCategoryImgUrl(sub.imageUrl || '');
    setEditSubCategoryHeroBannerUrl(sub.heroBannerUrl || '');
    setStatusMessage(null);
  };

  const handleSubCategoryUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubcategory) return;
    setStatusMessage(null);

    if (!editSubCategoryName.trim() || !editSubCategoryCategoryId) {
      setStatusMessage({ type: 'error', text: 'Subcategory Name and Parent Category are required.' });
      return;
    }

    startTransition(async () => {
      try {
        const response = await authFetch(`http://localhost:5001/api/admin/subcategories/${editingSubcategory._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editSubCategoryName,
            categoryId: editSubCategoryCategoryId,
            description: editSubCategoryDesc,
            imageUrl: editSubCategoryImgUrl,
            heroBannerUrl: editSubCategoryHeroBannerUrl,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatusMessage({ type: 'success', text: 'Subcategory updated successfully!' });
          setEditingSubcategory(null);
          await loadDashboardData();
        } else {
          setStatusMessage({ type: 'error', text: data.message || 'Subcategory update failed.' });
        }
      } catch {
        setStatusMessage({ type: 'error', text: 'Could not update subcategory.' });
      }
    });
  };

  const confirmDeleteSubcategory = async (id: string) => {
    setShowConfirmDeleteSubcategoryModal(null);
    setStatusMessage(null);
    try {
      const response = await authFetch(`http://localhost:5001/api/admin/subcategories/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMessage({ type: 'success', text: 'Subcategory deleted successfully!' });
        await loadDashboardData();
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Subcategory deletion failed.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Could not delete subcategory.' });
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
      const response = await authFetch(`http://localhost:5001/api/admin/categories/${id}`, {
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
      await authFetch('http://localhost:5001/api/admin/logout', {
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
      const res = await authFetch(`http://localhost:5001/api/admin/inquiries/${inquiryId}/status`, {
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
        const response = await authFetch('http://localhost:5001/api/admin/delta-difference', {
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
        const response = await authFetch(`http://localhost:5001/api/admin/delta-difference/${editingDeltaCard._id}`, {
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
      const response = await authFetch(`http://localhost:5001/api/admin/delta-difference/${id}`, {
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
          ? `http://localhost:5001/api/admin/clients/${editingClient._id}`
          : 'http://localhost:5001/api/admin/clients';
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
      const response = await authFetch(`http://localhost:5001/api/admin/clients/${id}`, {
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
      ? `http://localhost:5001/api/admin/sectors/${editingSector._id}`
      : 'http://localhost:5001/api/admin/sectors';
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
      const response = await authFetch(`http://localhost:5001/api/admin/sectors/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setStatusMessage({ type: 'success', text: 'Sector deleted successfully!' });
        await loadDashboardData();
        if (editingSector?._id === id) {
          resetSectorForm();
        }
      }
    } catch (err) {
      console.error('Delete sector error:', err);
      setStatusMessage({ type: 'error', text: 'Could not delete sector.' });
    }
  };

  // Tailored Solutions Handlers
  const resetSolutionForm = () => {
    setSolutionTitle('');
    setSolutionCategory('');
    setSolutionDesc('');
    setSolutionInitials('');
    setSolutionCtaText('');
    setSolutionHref('');
    setSolutionImgUrl('');
    setSolutionDisplayOrder(0);
    setSolutionIsActive(true);
    setEditingSolution(null);
    setIsCreatingSolution(false);
  };

  const openSolutionEdit = (item: any) => {
    setEditingSolution(item);
    setIsCreatingSolution(true);
    setSolutionTitle(item.title);
    setSolutionCategory(item.category);
    setSolutionDesc(item.description);
    setSolutionInitials(item.initials);
    setSolutionCtaText(item.ctaText);
    setSolutionHref(item.href);
    setSolutionImgUrl(item.imageUrl);
    setSolutionDisplayOrder(item.displayOrder || 0);
    setSolutionIsActive(item.isActive !== false);
  };

  const handleSaveSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!solutionTitle.trim() || !solutionCategory.trim() || !solutionDesc.trim() || !solutionCtaText.trim() || !solutionHref.trim()) {
      setStatusMessage({ type: 'error', text: 'Title, Category Badge, Description, CTA text, and Link Href are required.' });
      return;
    }

    startTransition(async () => {
      try {
        const url = editingSolution
          ? `http://localhost:5001/api/admin/solutions/${editingSolution._id}`
          : 'http://localhost:5001/api/admin/solutions';
        const method = editingSolution ? 'PUT' : 'POST';

        const res = await authFetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: solutionTitle,
            category: solutionCategory,
            description: solutionDesc,
            initials: solutionInitials,
            ctaText: solutionCtaText,
            href: solutionHref,
            imageUrl: solutionImgUrl,
            displayOrder: Number(solutionDisplayOrder) || 0,
            isActive: solutionIsActive,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setStatusMessage({ type: 'success', text: `Solution card ${editingSolution ? 'updated' : 'created'} successfully!` });
          resetSolutionForm();
          await loadDashboardData();
        } else {
          setStatusMessage({ type: 'error', text: data.message || 'Saving solution card failed.' });
        }
      } catch {
        setStatusMessage({ type: 'error', text: 'An error occurred while saving solution card.' });
      }
    });
  };

  const confirmDeleteSolution = async (id: string) => {
    setShowConfirmDeleteSolutionModal(null);
    setStatusMessage(null);
    try {
      const res = await authFetch(`http://localhost:5001/api/admin/solutions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: 'success', text: 'Solution card deleted successfully!' });
        await loadDashboardData();
        if (editingSolution?._id === id) {
          resetSolutionForm();
        }
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Deletion failed.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to delete solution card.' });
    }
  };

  // ── Featured Spotlight Handlers ──
  const resetSpotlightForm = () => {
    setEditingSpotlight(null);
    setIsCreatingSpotlight(false);
    setSelectedCatalogProductId('');
    setSpotIsActive(true);
    setSpotBadge('Featured Product');
    setSpotTitle('');
    setSpotSubtitle('');
    setSpotDescription('');
    setSpotImageUrl('');
    setSpotFeaturesText('');
    setSpotShowPrimary(true);
    setSpotPrimaryText('View Product');
    setSpotPrimaryHref('/products');
    setSpotShowSecondary(true);
    setSpotSecondaryText('Download Catalogue');
    setSpotSecondaryHref('');
    setSpotShowQuote(true);
    setSpotQuoteText('Request a Quote');
    setSpotDisplayOrder(0);
  };

  const openSpotlightEdit = (item: any) => {
    setEditingSpotlight(item);
    setIsCreatingSpotlight(true);
    const matched = productsList.find((p) => p.name.trim().toLowerCase() === (item.title || '').trim().toLowerCase());
    setSelectedCatalogProductId(matched ? matched._id : '');
    setSpotIsActive(item.isActive !== false);
    setSpotBadge(item.badge || 'Featured Product');
    setSpotTitle(item.title || '');
    setSpotSubtitle(item.subtitle || '');
    setSpotDescription(item.description || '');
    setSpotImageUrl(item.imageUrl || '');
    setSpotFeaturesText((item.features || []).join('\n'));
    setSpotShowPrimary(item.showPrimaryBtn !== false);
    setSpotPrimaryText(item.primaryBtnText || 'View Product');
    setSpotPrimaryHref(item.primaryBtnHref || '/products');
    setSpotShowSecondary(item.showSecondaryBtn !== false);
    setSpotSecondaryText(item.secondaryBtnText || 'Download Catalogue');
    setSpotSecondaryHref(item.secondaryBtnHref || '');
    setSpotShowQuote(item.showQuoteBtn !== false);
    setSpotQuoteText(item.quoteBtnText || 'Request a Quote');
    setSpotDisplayOrder(item.displayOrder || 0);
  };

  const handleSelectProductForSpotlight = (productId: string) => {
    setSelectedCatalogProductId(productId);
    if (!productId) return;
    const found = productsList.find((p) => p._id === productId);
    if (!found) return;

    setSpotTitle(found.name);
    if (found.description) {
      setSpotDescription(found.description);
    }
    if (found.category?.name) {
      setSpotSubtitle(found.category.name);
    }
    if (found.mediaUrls && found.mediaUrls.length > 0) {
      setSpotImageUrl(found.mediaUrls[0]);
    }
    if (found.keyFeatures && found.keyFeatures.length > 0) {
      setSpotFeaturesText(found.keyFeatures.join('\n'));
    }
    if (found.category?.slug && found.slug) {
      setSpotPrimaryHref(`/products/${found.category.slug}/${found.slug}`);
    } else if (found.slug) {
      setSpotPrimaryHref(`/products/${found.slug}`);
    }
    if (found.catalogUrl) {
      setSpotSecondaryHref(found.catalogUrl);
      setSpotShowSecondary(true);
    }
  };

  const handleSaveSpotlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotTitle.trim()) {
      setStatusMessage({ type: 'error', text: 'Title is required.' });
      return;
    }
    startTransition(async () => {
      try {
        const url = editingSpotlight
          ? `http://localhost:5001/api/admin/spotlight/${editingSpotlight._id}`
          : 'http://localhost:5001/api/admin/spotlight';
        const method = editingSpotlight ? 'PUT' : 'POST';
        const featuresArray = spotFeaturesText
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean);
        const res = await authFetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isActive: spotIsActive,
            badge: spotBadge,
            title: spotTitle,
            subtitle: spotSubtitle,
            description: spotDescription,
            imageUrl: spotImageUrl,
            features: featuresArray,
            showPrimaryBtn: spotShowPrimary,
            primaryBtnText: spotPrimaryText,
            primaryBtnHref: spotPrimaryHref,
            showSecondaryBtn: spotShowSecondary,
            secondaryBtnText: spotSecondaryText,
            secondaryBtnHref: spotSecondaryHref,
            showQuoteBtn: spotShowQuote,
            quoteBtnText: spotQuoteText,
            displayOrder: Number(spotDisplayOrder) || 0,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStatusMessage({ type: 'success', text: `Spotlight ${editingSpotlight ? 'updated' : 'created'} successfully!` });
          resetSpotlightForm();
          await loadDashboardData();
        } else {
          setStatusMessage({ type: 'error', text: data.message || 'Saving spotlight failed.' });
        }
      } catch {
        setStatusMessage({ type: 'error', text: 'An error occurred while saving spotlight.' });
      }
    });
  };

  const confirmDeleteSpotlight = async (id: string) => {
    setShowConfirmDeleteSpotlightModal(null);
    setStatusMessage(null);
    try {
      const res = await authFetch(`http://localhost:5001/api/admin/spotlight/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: 'success', text: 'Spotlight deleted successfully!' });
        await loadDashboardData();
        if (editingSpotlight?._id === id) resetSpotlightForm();
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Deletion failed.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to delete spotlight.' });
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

          {/* Floating Status Toast Notifications (Always visible wherever scrolled) */}
          <div className={styles.toastWrapper}>
            <AnimatePresence mode="wait">
              {statusMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className={`${styles.statusBanner} ${statusMessage.type === 'success' ? styles.statusSuccess : styles.statusError}`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '24px', flexShrink: 0 }}>
                    {statusMessage.type === 'success' ? 'check_circle' : 'error'}
                  </span>
                  <span style={{ lineHeight: 1.4 }}>{statusMessage.text}</span>
                  <button
                    type="button"
                    className={styles.toastCloseBtn}
                    onClick={() => setStatusMessage(null)}
                    aria-label="Dismiss notification"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Uploading Progress */}
          {uploadingFile && (
            <div style={{ marginBottom: '24px', background: 'rgba(10, 141, 147, 0.06)', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(10, 141, 147, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.88rem', color: '#0A8D93', fontWeight: 650, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cloud_upload</span>
                  Uploading asset to AWS Cloud Storage...
                </span>
                <span style={{ fontSize: '0.85rem', color: '#0A8D93', fontWeight: 700 }}>{uploadProgress}%</span>
              </div>
              <div className={styles.progressBarContainer} style={{ marginTop: 0 }}>
                <div className={styles.progressBar} style={{ width: `${uploadProgress}%`, transition: 'width 0.2s ease-out' }} />
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
                  {/* 1. Card Image (800x800) */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                        Card Image (800 × 800 px) *
                      </label>
                      <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Square 1:1</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                      Clean square photo for catalog cards, carousels, and navigation menus.
                    </p>
                    <div className={styles.categoryDetailImage} style={{ height: '220px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                      <Image src={editCategoryImage} alt={editCategoryName} fill sizes="(max-width: 900px) 100vw, 45vw" style={{ objectFit: 'contain', padding: '8px' }} />
                    </div>
                    <label className={styles.detailUploadButton} style={{ marginTop: '8px' }}>
                      <span className="material-symbols-outlined">upload</span>
                      Replace Card Image (800 × 800)
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
                  </div>

                  {/* 2. Hero Banner (2040x600) */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                        Hero Banner (2040 × 600 px)
                      </label>
                      <span style={{ fontSize: '0.72rem', background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Panoramic</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                      Wide panoramic banner specifically displayed at the top header of this category page.
                    </p>
                    {editCategoryHeroBanner ? (
                      <div style={{ position: 'relative', width: '100%', height: '120px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1', marginBottom: '8px' }}>
                        <Image src={editCategoryHeroBanner} alt="Hero Banner Preview" fill sizes="(max-width: 900px) 100vw, 45vw" style={{ objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => setEditCategoryHeroBanner('')}
                          style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                          title="Remove Hero Banner"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '10px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>No hero banner uploaded (page will smoothly fall back to Card Image)</span>
                      </div>
                    )}
                    <label className={styles.detailUploadButton}>
                      <span className="material-symbols-outlined">panorama</span>
                      {editCategoryHeroBanner ? 'Replace Hero Banner (2040 × 600)' : 'Upload Hero Banner (2040 × 600)'}
                      <input
                        type="file"
                        accept="image/*"
                        className={styles.fileInput}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleFileUpload(file);
                            if (url) setEditCategoryHeroBanner(url);
                          }
                        }}
                      />
                    </label>
                  </div>
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
                    <label className={styles.label} htmlFor="edit-product-category">Category *</label>
                    <select
                      id="edit-product-category"
                      className={styles.input}
                      value={editProductCategoryId}
                      onChange={(e) => {
                        setEditProductCategoryId(e.target.value);
                        setEditProductSubcategoryId('');
                      }}
                      required
                    >
                      <option value="">Select Category</option>
                      {categoriesList.map((category) => (
                        <option key={category._id} value={category._id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="edit-product-subcategory">
                      Subcategory <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#64748b' }}>(Optional)</span>
                    </label>
                    <select
                      id="edit-product-subcategory"
                      className={styles.input}
                      value={editProductSubcategoryId}
                      onChange={(e) => setEditProductSubcategoryId(e.target.value)}
                      disabled={!editProductCategoryId}
                    >
                      <option value="">Select Subcategory (Optional)</option>
                      {subcategoriesList
                        .filter((sub) => {
                          const parentId = typeof sub.category === 'object' ? sub.category?._id : sub.category;
                          return parentId === editProductCategoryId;
                        })
                        .map((sub) => (
                          <option key={sub._id} value={sub._id}>{sub.name}</option>
                        ))}
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label} htmlFor="edit-product-display-order">
                      Display Order / Sequence Number <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#64748b' }}>(e.g. 1 = 1st, 2 = 2nd, 3 = 3rd... 0 = default unranked)</span>
                    </label>
                    <input
                      id="edit-product-display-order"
                      type="number"
                      min="0"
                      className={styles.input}
                      value={editProductDisplayOrder}
                      onChange={(e) => setEditProductDisplayOrder(parseInt(e.target.value) || 0)}
                    />
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
                  {/* ⭐ Star Rating & Manual Override Card */}
                  <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '18px', marginTop: '16px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>⭐</span>
                        <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#0f172a' }}>
                          Star Rating &amp; Manual Override
                        </h4>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 650, background: editProductRatingMode === 'manual' ? '#e0f2fe' : '#f0fdf4', color: editProductRatingMode === 'manual' ? '#0369a1' : '#15803d', padding: '3px 10px', borderRadius: '20px' }}>
                        {editProductRatingMode === 'manual' ? 'Manual Active' : 'Automatic Active'}
                      </span>
                    </div>

                    {/* Mode Selector Toggle */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                      <button
                        type="button"
                        onClick={() => setEditProductRatingMode('manual')}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          border: editProductRatingMode === 'manual' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                          background: editProductRatingMode === 'manual' ? '#f0f9ff' : '#ffffff',
                          fontWeight: 650,
                          fontSize: '0.85rem',
                          color: editProductRatingMode === 'manual' ? '#0369a1' : '#64748b',
                          cursor: 'pointer',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          alignItems: 'center',
                        }}
                      >
                        <span>🔘 Manual Override</span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>Custom score &amp; count</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditProductRatingMode('auto')}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          border: editProductRatingMode === 'auto' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                          background: editProductRatingMode === 'auto' ? '#f0fdf4' : '#ffffff',
                          fontWeight: 650,
                          fontSize: '0.85rem',
                          color: editProductRatingMode === 'auto' ? '#15803d' : '#64748b',
                          cursor: 'pointer',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          alignItems: 'center',
                        }}
                      >
                        <span>⚡ Automatic Mode</span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>Real visitor average</span>
                      </button>
                    </div>

                    {/* Inputs when manual mode is selected */}
                    {editProductRatingMode === 'manual' ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            Display Rating Score (1.0 to 5.0)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="1.0"
                            max="5.0"
                            className={styles.input}
                            value={editProductManualRating}
                            onChange={(e) => setEditProductManualRating(parseFloat(e.target.value) || 5.0)}
                            style={{ width: '100%' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            Display Total Ratings Count
                          </label>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            className={styles.input}
                            value={editProductManualRatingCount}
                            onChange={(e) => setEditProductManualRatingCount(parseInt(e.target.value, 10) || 0)}
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#475569' }}>
                        📊 <strong>Live User Stats:</strong> {editProductAutoAvg.toFixed(1)} ★ based on {editProductAutoCount} real visitor star submissions.
                      </div>
                    )}
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
                  <button
                    type="button"
                    onClick={() => { setManageView('subcategories'); setSearchQuery(''); setSelectedCategoryFilter(''); }}
                    className={`${styles.toggleBtn} ${manageView === 'subcategories' ? styles.toggleBtnActive : ''}`}
                    style={{ position: 'relative' }}
                  >
                    {manageView === 'subcategories' && (
                      <motion.div
                        layoutId="toggleActive"
                        className={styles.toggleActiveBg}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span style={{ position: 'relative', zIndex: 2 }}>Subcategories</span>
                  </button>
                </div>
              </div>

              {/* Interactive Category Filter Bar */}
              {(manageView === 'products' || manageView === 'subcategories') && (
                <div className={`${styles.categoryFilterBar} no-scrollbar`}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryFilter('');
                      setSelectedSubcategoryFilter('');
                    }}
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
                    <span style={{ position: 'relative', zIndex: 2 }}>
                      {manageView === 'subcategories' ? 'All Subcategories' : 'All Products'}
                    </span>
                    <span className={`${styles.pillCount} ${selectedCategoryFilter === '' ? styles.pillCountActive : ''}`} style={{ position: 'relative', zIndex: 2 }}>
                      {manageView === 'subcategories' ? subcategoriesList.length : productsList.length}
                    </span>
                  </button>
                  {categoriesList.map((cat) => {
                    const count = manageView === 'subcategories'
                      ? subcategoriesList.filter((s) => {
                          const parentId = typeof s.category === 'object' ? s.category?._id : s.category;
                          return parentId === cat._id;
                        }).length
                      : productsList.filter((p) => p.category?._id === cat._id).length;

                    return (
                      <button
                        key={cat._id}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryFilter(cat._id);
                          setSelectedSubcategoryFilter('');
                        }}
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

              {/* 🌿 User-Friendly Nested Subcategory Filter Bar (Products View) */}
              {manageView === 'products' && (() => {
                const availableSubs = subcategoriesList.filter((sub) => {
                  if (!selectedCategoryFilter) return true;
                  const parentId = typeof sub.category === 'object' ? sub.category?._id : sub.category;
                  return parentId === selectedCategoryFilter;
                });

                if (availableSubs.length === 0) return null;

                const parentCatName = categoriesList.find(c => c._id === selectedCategoryFilter)?.name;

                return (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginBottom: '24px',
                    padding: '12px 18px',
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #cbd5e1',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '19px', color: '#0a8d93' }}>account_tree</span>
                      <span>{parentCatName ? `${parentCatName} Subcategories:` : 'Subcategories:'}</span>
                    </div>

                    {/* All Subcategories Pill */}
                    <button
                      type="button"
                      onClick={() => setSelectedSubcategoryFilter('')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.82rem',
                        fontWeight: 650,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: selectedSubcategoryFilter === '' ? '1.5px solid #0a8d93' : '1px solid #e2e8f0',
                        background: selectedSubcategoryFilter === '' ? '#e6f7f8' : '#f8fafc',
                        color: selectedSubcategoryFilter === '' ? '#0a8d93' : '#64748b',
                      }}
                    >
                      <span>All Subcategories</span>
                      <span style={{
                        fontSize: '0.72rem',
                        background: selectedSubcategoryFilter === '' ? '#0a8d93' : '#e2e8f0',
                        color: selectedSubcategoryFilter === '' ? '#ffffff' : '#64748b',
                        padding: '1px 7px',
                        borderRadius: '10px',
                        fontWeight: 700,
                      }}>
                        {selectedCategoryFilter
                          ? productsList.filter(p => p.category?._id === selectedCategoryFilter).length
                          : productsList.length}
                      </span>
                    </button>

                    {/* Dynamic Subcategory Pills */}
                    {availableSubs.map((sub) => {
                      const count = productsList.filter((p) => {
                        const pSubId = typeof p.subcategory === 'object' ? p.subcategory?._id : (typeof p.subcategory === 'string' ? p.subcategory : '');
                        return pSubId === sub._id;
                      }).length;

                      const isSelected = selectedSubcategoryFilter === sub._id;

                      return (
                        <button
                          key={sub._id}
                          type="button"
                          onClick={() => setSelectedSubcategoryFilter(isSelected ? '' : sub._id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '0.82rem',
                            fontWeight: 650,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            border: isSelected ? '1.5px solid #0a8d93' : '1px solid #e2e8f0',
                            background: isSelected ? '#e6f7f8' : '#f8fafc',
                            color: isSelected ? '#0a8d93' : '#475569',
                          }}
                        >
                          <span>{sub.name}</span>
                          <span style={{
                            fontSize: '0.72rem',
                            background: isSelected ? '#0a8d93' : '#e2e8f0',
                            color: isSelected ? '#ffffff' : '#64748b',
                            padding: '1px 7px',
                            borderRadius: '10px',
                            fontWeight: 700,
                          }}>
                            {count}
                          </span>
                        </button>
                      );
                    })}

                    {/* Quick Clear Filter Link */}
                    {selectedSubcategoryFilter && (
                      <button
                        type="button"
                        onClick={() => setSelectedSubcategoryFilter('')}
                        style={{
                          marginLeft: 'auto',
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>close</span>
                        Clear Subcategory Filter
                      </button>
                    )}
                  </div>
                );
              })()}

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
                  {manageView === 'subcategories' ? (
                    // Filtered Subcategories
                    (() => {
                      const filteredSubs = subcategoriesList.filter((sub) => {
                        const matchesSearch =
                          sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (sub.description && sub.description.toLowerCase().includes(searchQuery.toLowerCase()));
                        
                        const parentId = typeof sub.category === 'object' ? sub.category?._id : sub.category;
                        const matchesCategory = !selectedCategoryFilter || parentId === selectedCategoryFilter;

                        return matchesSearch && matchesCategory;
                      });

                      return filteredSubs.length > 0 ? (
                        <motion.div layout className={styles.categoryOverviewGrid} key="subs-grid">
                          <AnimatePresence mode="popLayout">
                            {filteredSubs.map((sub) => {
                              const parentName = typeof sub.category === 'object' ? sub.category?.name : 'Category';
                              const prodCount = productsList.filter(p => p.subcategory?._id === sub._id || (p.subcategory as any) === sub._id).length;

                              return (
                                <motion.div
                                  layout
                                  initial={{ opacity: 0, y: 30 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                                  key={sub._id}
                                  className={styles.categoryOverviewCard}
                                  style={{ position: 'relative', cursor: 'default', textDecoration: 'none' }}
                                >
                                  <div className={styles.categoryOverviewImage}>
                                    {sub.imageUrl ? (
                                      <Image src={sub.imageUrl} alt={sub.name} fill sizes="(max-width: 900px) 100vw, 33vw" />
                                    ) : (
                                      <div className={styles.mediaFallback}>
                                        <span className="material-symbols-outlined">account_tree</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className={styles.categoryOverviewName} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                      <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{sub.name}</h3>
                                      <span style={{ fontSize: '0.75rem', background: 'rgba(10, 141, 147, 0.1)', color: '#0A8D93', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                                        {parentName}
                                      </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginTop: '4px' }}>
                                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{prodCount} {prodCount === 1 ? 'Product' : 'Products'}</span>
                                      <div style={{ display: 'flex', gap: '6px' }}>
                                        <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); openSubCategoryEdit(sub); }}
                                          style={{ background: '#0a8d93', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        >
                                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); setShowConfirmDeleteSubcategoryModal(sub._id); }}
                                          style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        >
                                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </AnimatePresence>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={styles.emptyState}
                          key="subs-empty"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>search_off</span>
                          <p>No subcategories match your search query: "{searchQuery}"</p>
                        </motion.div>
                      );
                    })()
                  ) : manageView === 'categories' ? (
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
                          (prod.category?.name && prod.category.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (prod.subcategory?.name && prod.subcategory.name.toLowerCase().includes(searchQuery.toLowerCase()));

                        const matchesCategory =
                          !selectedCategoryFilter ||
                          prod.category?._id === selectedCategoryFilter;

                        const prodSubId = typeof prod.subcategory === 'object' ? prod.subcategory?._id : (typeof prod.subcategory === 'string' ? prod.subcategory : '');
                        const matchesSubcategory =
                          !selectedSubcategoryFilter ||
                          prodSubId === selectedSubcategoryFilter;

                        return matchesSearch && matchesCategory && matchesSubcategory;
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
                                  <div className={styles.productOverviewName} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                      <h3>{prod.name}</h3>
                                      <span aria-hidden="true">-&gt;</span>
                                    </div>
                                    {/* Subcategory & Category Badge */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                                      <span style={{ fontSize: '0.72rem', fontWeight: 650, color: '#0a8d93', background: '#e6f7f8', padding: '2px 7px', borderRadius: '4px' }}>
                                        {prod.category?.name || 'Category'}
                                      </span>
                                      {prod.subcategory && (
                                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', background: '#f1f5f9', padding: '2px 7px', borderRadius: '4px' }}>
                                          {typeof prod.subcategory === 'object' ? prod.subcategory.name : ''}
                                        </span>
                                      )}
                                      {prod.displayOrder && prod.displayOrder > 0 ? (
                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '2px 7px', borderRadius: '4px' }}>
                                          Order #{prod.displayOrder}
                                        </span>
                                      ) : (
                                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '2px 7px', borderRadius: '4px' }}>
                                          Default Order
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </motion.button>
                              ))}
                            </AnimatePresence>
                          </motion.div>
                          {filteredProds.length > visibleProductsCount && (
                            <div ref={productLoaderRef} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '36px 0', color: '#64748b', gap: '10px' }}>
                              <div style={{ width: '20px', height: '20px', border: '2px solid #cbd5e1', borderTopColor: '#0a8d93', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading more products ({Math.min(visibleProductsCount, filteredProds.length)} of {filteredProds.length})...</span>
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
                    Category Name
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
                    Description
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

                {/* 1. Card Image (800x800) */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label className={styles.label}>Card Image (800 × 800 px) *</label>
                    <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Square 1:1</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px 0' }}>
                    Clean square photo for catalog cards, carousels, and menus.
                  </p>
                  <label className={styles.uploadBox}>
                    <svg className={styles.uploadIcon} xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                    <span className={styles.uploadText}>Click to upload Card Image (800 × 800)</span>
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
                        <img src={categoryImgUrl} alt="Card Preview" className={styles.previewImage} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} />
                        <button type="button" className={styles.removePreviewBtn} onClick={() => setCategoryImgUrl('')}>✕</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Hero Banner (2040x600) */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label className={styles.label}>Hero Banner (2040 × 600 px) <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#64748b' }}>(Optional)</span></label>
                    <span style={{ fontSize: '0.72rem', background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Panoramic</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px 0' }}>
                    Wide panoramic banner specifically for the page header. If left blank, it will automatically fall back to Card Image.
                  </p>
                  <label className={styles.uploadBox}>
                    <svg className={styles.uploadIcon} xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="12" x="3" y="6" rx="2" />
                      <circle cx="8" cy="11" r="1.5" />
                      <path d="m21 15-5-5L5 18" />
                    </svg>
                    <span className={styles.uploadText}>Click to upload Hero Banner (2040 × 600)</span>
                    <span className={styles.uploadSubtext}>Wide panoramic format (Max 8MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className={styles.fileInput}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleFileUpload(file);
                          if (url) setCategoryHeroBannerUrl(url);
                        }
                      }}
                    />
                  </label>

                  {categoryHeroBannerUrl && (
                    <div style={{ marginTop: '12px', position: 'relative', width: '100%', height: '120px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                      <img src={categoryHeroBannerUrl} alt="Hero Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setCategoryHeroBannerUrl('')}
                        style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                      >
                        ✕
                      </button>
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

          {/* CREATE SUBCATEGORY FORM */}
          {activeTab === 'subcategories' && (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubCategorySubmit}
              className={styles.formCard}
            >
              <h2 className={styles.sectionTitle}>New Product Subcategory</h2>

              <div className={styles.grid}>
                <div className={styles.inputGroup}>
                  <label className={styles.label} htmlFor="subcategory-name">
                    Subcategory Name *
                  </label>
                  <input
                    id="subcategory-name"
                    type="text"
                    placeholder="e.g. Human Skeleton Models"
                    className={styles.input}
                    value={subCategoryName}
                    onChange={(e) => setSubCategoryName(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label} htmlFor="subcategory-parent">Parent Category *</label>
                  <select
                    id="subcategory-parent"
                    className={styles.input}
                    value={subCategoryCategoryId}
                    onChange={(e) => setSubCategoryCategoryId(e.target.value)}
                    required
                  >
                    <option value="">Select Parent Category</option>
                    {categoriesList.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label className={styles.label} htmlFor="subcategory-desc">
                    Description <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#64748b' }}>(Optional)</span>
                  </label>
                  <input
                    id="subcategory-desc"
                    type="text"
                    placeholder="Brief summary of subcategory range"
                    className={styles.input}
                    value={subCategoryDesc}
                    onChange={(e) => setSubCategoryDesc(e.target.value)}
                  />
                </div>

                {/* 1. Card Image (800x800) */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label className={styles.label}>Card Image (800 × 800 px) <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#64748b' }}>(Optional)</span></label>
                    <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Square 1:1</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px 0' }}>
                    Clean square photo for subcategory grid cards and navigation menus.
                  </p>
                  <label className={styles.uploadBox}>
                    <svg className={styles.uploadIcon} xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                    <span className={styles.uploadText}>Click to upload Card Image (800 × 800)</span>
                    <span className={styles.uploadSubtext}>Supports JPG, PNG (Max 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className={styles.fileInput}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleFileUpload(file);
                          if (url) setSubCategoryImgUrl(url);
                        }
                      }}
                    />
                  </label>

                  {subCategoryImgUrl && (
                    <div className={styles.previewList}>
                      <div className={styles.previewItem}>
                        <img src={subCategoryImgUrl} alt="Subcategory Card Preview" className={styles.previewImage} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} />
                        <button type="button" className={styles.removePreviewBtn} onClick={() => setSubCategoryImgUrl('')}>✕</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Hero Banner (2040x600) */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label className={styles.label}>Hero Banner (2040 × 600 px) <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#64748b' }}>(Optional)</span></label>
                    <span style={{ fontSize: '0.72rem', background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Panoramic</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px 0' }}>
                    Wide panoramic banner specifically for the page header when this subcategory is selected.
                  </p>
                  <label className={styles.uploadBox}>
                    <svg className={styles.uploadIcon} xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="12" x="3" y="6" rx="2" />
                      <circle cx="8" cy="11" r="1.5" />
                      <path d="m21 15-5-5L5 18" />
                    </svg>
                    <span className={styles.uploadText}>Click to upload Hero Banner (2040 × 600)</span>
                    <span className={styles.uploadSubtext}>Wide panoramic format (Max 8MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className={styles.fileInput}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleFileUpload(file);
                          if (url) setSubCategoryHeroBannerUrl(url);
                        }
                      }}
                    />
                  </label>

                  {subCategoryHeroBannerUrl && (
                    <div style={{ marginTop: '12px', position: 'relative', width: '100%', height: '120px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                      <img src={subCategoryHeroBannerUrl} alt="Subcategory Hero Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setSubCategoryHeroBannerUrl('')}
                        style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                      >
                        ✕
                      </button>
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
                Create Subcategory
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
                    Product Name
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
                  <label className={styles.label} htmlFor="product-category">Category *</label>
                  <select
                    id="product-category"
                    className={styles.input}
                    value={productCategoryId}
                    onChange={(e) => {
                      setProductCategoryId(e.target.value);
                      setProductSubcategoryId('');
                    }}
                    required
                  >
                    <option value="">Select Category</option>
                    {categoriesList.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label} htmlFor="product-subcategory">
                    Subcategory <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#64748b' }}>(Optional)</span>
                  </label>
                  <select
                    id="product-subcategory"
                    className={styles.input}
                    value={productSubcategoryId}
                    onChange={(e) => setProductSubcategoryId(e.target.value)}
                    disabled={!productCategoryId}
                  >
                    <option value="">Select Subcategory (Optional)</option>
                    {subcategoriesList
                      .filter((sub) => {
                        const parentId = typeof sub.category === 'object' ? sub.category?._id : sub.category;
                        return parentId === productCategoryId;
                      })
                      .map((sub) => (
                        <option key={sub._id} value={sub._id}>{sub.name}</option>
                      ))}
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label} htmlFor="product-display-order">
                    Display Order / Sequence Number <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#64748b' }}>(e.g. 1 = 1st, 2 = 2nd, 3 = 3rd... 0 = default unranked)</span>
                  </label>
                  <input
                    id="product-display-order"
                    type="number"
                    min="0"
                    placeholder="e.g. 1"
                    className={styles.input}
                    value={productDisplayOrder}
                    onChange={(e) => setProductDisplayOrder(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                  <label className={styles.label} htmlFor="product-desc">
                    Description
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
                {/* ⭐ Star Rating & Manual Override in New Product Form */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '18px', margin: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>⭐</span>
                      <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#0f172a' }}>
                        Initial Star Rating Configuration
                      </h4>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                    <button
                      type="button"
                      onClick={() => setProductRatingMode('manual')}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: productRatingMode === 'manual' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                        background: productRatingMode === 'manual' ? '#f0f9ff' : '#ffffff',
                        fontWeight: 650,
                        fontSize: '0.85rem',
                        color: productRatingMode === 'manual' ? '#0369a1' : '#64748b',
                        cursor: 'pointer',
                      }}
                    >
                      🔘 Manual Override
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductRatingMode('auto')}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: productRatingMode === 'auto' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                        background: productRatingMode === 'auto' ? '#f0fdf4' : '#ffffff',
                        fontWeight: 650,
                        fontSize: '0.85rem',
                        color: productRatingMode === 'auto' ? '#15803d' : '#64748b',
                        cursor: 'pointer',
                      }}
                    >
                      ⚡ Automatic (Calculated)
                    </button>
                  </div>

                  {productRatingMode === 'manual' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                          Initial Rating Score (1.0 to 5.0)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="1.0"
                          max="5.0"
                          className={styles.input}
                          value={productManualRating}
                          onChange={(e) => setProductManualRating(parseFloat(e.target.value) || 5.0)}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                          Initial Ratings Count
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          className={styles.input}
                          value={productManualRatingCount}
                          onChange={(e) => setProductManualRatingCount(parseInt(e.target.value, 10) || 0)}
                        />
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
                    Manage the sector lab cards displayed under "Our Sectors" on the home page.
                  </p>
                </div>
                {!isCreatingSector && (
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
                    Add New Sector
                  </button>
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
                    </div>
                    <input
                      type="text"

                      value={sectorTitle}
                      onChange={(e) => setSectorTitle(e.target.value)}
                      placeholder="e.g. Anatomy Lab"
                      required
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontWeight: '500' }}
                    />
                  </div>

                  {/* Short Description */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b' }}>
                        Short Description <span style={{ color: '#ef4444' }}>*</span>
                      </label>
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

          {/* ========================================== */}
          {/* TAILORED SOLUTIONS TAB                     */}
          {/* ========================================== */}
          {activeTab === 'solutions' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              <div className={styles.listSectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className={styles.listSectionTitle}>
                  <span className="material-symbols-outlined">grid_view</span>
                  <span>Tailored Training Solutions Cards</span>
                </h2>
                {!isCreatingSolution && (
                  <button
                    type="button"
                    onClick={() => { resetSolutionForm(); setIsCreatingSolution(true); }}
                    style={{
                      background: '#0a8d93',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span className="material-symbols-outlined">add</span>
                    Add Solution Card
                  </button>
                )}
              </div>

              {/* Solution Card Create/Edit Form */}
              {isCreatingSolution && (
                <motion.form
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleSaveSolution}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '16px',
                    padding: '32px',
                    boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                      {editingSolution ? 'Edit Solution Card' : 'Create New Solution Card'}
                    </h3>
                    <button
                      type="button"
                      onClick={resetSolutionForm}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.25rem' }}
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label} style={{ color: '#334155', fontWeight: 'bold' }}>Card Title *</label>
                      <input
                        type="text"
                        className={styles.input}
                        style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }}
                        placeholder="e.g. Anatomy Models"
                        value={solutionTitle}
                        onChange={(e) => setSolutionTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label} style={{ color: '#334155', fontWeight: 'bold' }}>Category Badge Label *</label>
                      <input
                        type="text"
                        className={styles.input}
                        style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }}
                        placeholder="e.g. ANATOMY, FLAGSHIP SERVICE, SIMULATORS"
                        value={solutionCategory}
                        onChange={(e) => setSolutionCategory(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label} style={{ color: '#334155', fontWeight: 'bold' }}>Initials Badge (2-3 chars) *</label>
                      <input
                        type="text"
                        className={styles.input}
                        style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }}
                        placeholder="e.g. AM, MS, TT, PS, VR"
                        value={solutionInitials}
                        onChange={(e) => setSolutionInitials(e.target.value)}
                        maxLength={4}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label} style={{ color: '#334155', fontWeight: 'bold' }}>Button Text (CTA) *</label>
                      <input
                        type="text"
                        className={styles.input}
                        style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }}
                        placeholder="e.g. Explore Anatomy Models"
                        value={solutionCtaText}
                        onChange={(e) => setSolutionCtaText(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label} style={{ color: '#334155', fontWeight: 'bold' }}>Link Href *</label>
                      <input
                        type="text"
                        className={styles.input}
                        style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }}
                        placeholder="e.g. /products/anatomy-models or /simulation-centre"
                        value={solutionHref}
                        onChange={(e) => setSolutionHref(e.target.value)}
                        required
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label} style={{ color: '#334155', fontWeight: 'bold' }}>Display Order</label>
                      <input
                        type="number"
                        className={styles.input}
                        style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }}
                        value={solutionDisplayOrder}
                        onChange={(e) => setSolutionDisplayOrder(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label} style={{ color: '#334155', fontWeight: 'bold' }}>Description *</label>
                    <textarea
                      className={styles.input}
                      style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }}
                      rows={3}
                      placeholder="Brief description of this training solution..."
                      value={solutionDesc}
                      onChange={(e) => setSolutionDesc(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label} style={{ color: '#334155', fontWeight: 'bold' }}>Card Banner Image</label>
                    <label className={styles.uploadBox} style={{ padding: '20px', background: '#f8fafc', border: '2px dashed #cbd5e1' }}>
                      <span className={styles.uploadText} style={{ color: '#475569', fontWeight: '500' }}>Click to upload Solution Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className={styles.fileInput}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleFileUpload(file);
                            if (url) setSolutionImgUrl(url);
                          }
                        }}
                      />
                    </label>
                    {solutionImgUrl && (
                      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <img src={solutionImgUrl} alt="Preview" style={{ width: '90px', height: '65px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #cbd5e1' }} />
                        <button type="button" onClick={() => setSolutionImgUrl('')} style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
                          Remove Image
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                    <button
                      type="button"
                      onClick={resetSolutionForm}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending || uploadingFile}
                      style={{ background: '#0a8d93', color: '#ffffff', border: 'none', padding: '10px 28px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      {isPending ? 'Saving...' : editingSolution ? 'Update Solution Card' : 'Create Solution Card'}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Solutions Grid */}
              {loadingData ? (
                <p>Loading solutions...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {solutionsList.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                      {solutionsList.map((sol) => (
                        <div
                          key={sol._id}
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
                          <div style={{ position: 'relative', height: '160px', background: '#0f172a', overflow: 'hidden' }}>
                            <img
                              src={sol.imageUrl}
                              alt={sol.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(10, 141, 147, 0.95)', padding: '4px 10px', borderRadius: '20px', color: '#ffffff', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              Order: {sol.displayOrder}
                            </div>
                            <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#0a8d93', padding: '4px 10px', borderRadius: '6px', color: '#ffffff', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              {sol.category} ({sol.initials})
                            </div>
                          </div>

                          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                              {sol.title}
                            </h4>
                            <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                              {sol.description}
                            </p>
                            <div style={{ fontSize: '0.8rem', color: '#0a8d93', fontWeight: 'bold', marginTop: '4px' }}>
                              CTA: {sol.ctaText} → {sol.href}
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid #e2e8f0', padding: '14px 20px', gap: '8px', background: '#f8fafc' }}>
                            <button
                              type="button"
                              onClick={() => openSolutionEdit(sol)}
                              style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '8px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowConfirmDeleteSolutionModal(sol._id)}
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
                      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#0a8d93', marginBottom: '12px' }}>grid_view</span>
                      <p style={{ color: '#475569', fontWeight: '500' }}>No solution cards found in database.</p>
                      <button
                        type="button"
                        onClick={() => { resetSolutionForm(); setIsCreatingSolution(true); }}
                        style={{ marginTop: '16px', background: '#0a8d93', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Add Your First Solution Card
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              FEATURED PRODUCT SPOTLIGHT TAB
          ───────────────────────────────────────────────────────────── */}
          {activeTab === 'spotlight' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              <div className={styles.listSectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className={styles.listSectionTitle}>
                  <span className="material-symbols-outlined">stars</span>
                  <span>Featured Product Spotlight</span>
                </h2>
                {!isCreatingSpotlight && (
                  <button
                    type="button"
                    onClick={() => { resetSpotlightForm(); setIsCreatingSpotlight(true); }}
                    style={{
                      background: '#0a8d93',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 8px rgba(10, 141, 147, 0.25)'
                    }}
                  >
                    <span className="material-symbols-outlined">add</span>
                    Add Spotlight
                  </button>
                )}
              </div>

              {/* Spotlight Create / Edit Form */}
              {isCreatingSpotlight && (
                <motion.form
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleSaveSpotlight}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '16px',
                    padding: '32px',
                    boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                      {editingSpotlight ? 'Edit Spotlight' : 'Create New Spotlight'}
                    </h3>
                    <button
                      type="button"
                      onClick={resetSpotlightForm}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.25rem' }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Active Toggle Banner */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f0fdfa', borderRadius: '12px', border: '1px solid #99f6e4' }}>
                    <div>
                      <span style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 'bold', display: 'block' }}>Show on Homepage</span>
                      <span style={{ color: '#0d9488', fontSize: '0.8rem' }}>When active, this spotlight is prominently featured between Tailored Solutions and Client Logos.</span>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer', flexShrink: 0 }}>
                      <input type="checkbox" checked={spotIsActive} onChange={e => setSpotIsActive(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                      <span style={{ position: 'absolute', inset: 0, borderRadius: '13px', background: spotIsActive ? '#0a8d93' : '#cbd5e1', transition: '0.2s' }} />
                      <span style={{ position: 'absolute', top: '3px', left: spotIsActive ? '25px' : '3px', width: '20px', height: '20px', background: '#fff', borderRadius: '50%', transition: '0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                    </label>
                  </div>

                  {/* Select Existing Product Dropdown */}
                  <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <label style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-symbols-outlined" style={{ color: '#0a8d93', fontSize: '22px' }}>inventory_2</span>
                        Select from Already Added Products
                      </label>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Auto-fills Title, Subtitle, Description, Image, Key Features & Link
                      </span>
                    </div>
                    <select
                      className={styles.input}
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid #0a8d93',
                        color: '#0f172a',
                        fontSize: '0.92rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        padding: '10px 14px'
                      }}
                      value={selectedCatalogProductId}
                      onChange={(e) => handleSelectProductForSpotlight(e.target.value)}
                    >
                      <option value="">-- Choose a product from catalog to auto-fill --</option>
                      {productsList.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.category?.name ? `[${p.category.name}] ` : ''}{p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fields Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <div className={styles.inputGroup}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className={styles.label} style={{ color: '#334155', fontWeight: 'bold' }}>Product Title *</label>
                        {selectedCatalogProductId && (
                          <span style={{ fontSize: '0.72rem', color: '#0a8d93', fontWeight: 'bold' }}>Linked to Catalog</span>
                        )}
                      </div>
                      <input
                        type="text"
                        list="catalog-products-datalist"
                        className={styles.input}
                        style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }}
                        value={spotTitle}
                        onChange={e => {
                          const val = e.target.value;
                          setSpotTitle(val);
                          const matched = productsList.find((p) => p.name.trim().toLowerCase() === val.trim().toLowerCase());
                          if (matched) {
                            handleSelectProductForSpotlight(matched._id);
                          }
                        }}
                        required
                        placeholder="Select from dropdown or type title..."
                      />
                      <datalist id="catalog-products-datalist">
                        {productsList.map((p) => (
                          <option key={p._id} value={p.name}>
                            {p.category?.name ? `${p.category.name}` : ''}
                          </option>
                        ))}
                      </datalist>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label} style={{ color: '#334155', fontWeight: 'bold' }}>Badge Label</label>
                      <input
                        type="text"
                        className={styles.input}
                        style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }}
                        value={spotBadge}
                        onChange={e => setSpotBadge(e.target.value)}
                        placeholder="e.g. New Launch or Featured Product"
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label} style={{ color: '#334155', fontWeight: 'bold' }}>Subtitle / Tagline</label>
                      <input
                        type="text"
                        className={styles.input}
                        style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }}
                        value={spotSubtitle}
                        onChange={e => setSpotSubtitle(e.target.value)}
                        placeholder="e.g. Life-size 3D anatomical model with 20 detachable parts"
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label} style={{ color: '#334155', fontWeight: 'bold' }}>Display Order</label>
                      <input
                        type="number"
                        className={styles.input}
                        style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }}
                        value={spotDisplayOrder}
                        onChange={e => setSpotDisplayOrder(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className={styles.inputGroup}>
                    <label className={styles.label} style={{ color: '#334155', fontWeight: 'bold' }}>Description</label>
                    <textarea
                      className={styles.input}
                      style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }}
                      rows={3}
                      value={spotDescription}
                      onChange={e => setSpotDescription(e.target.value)}
                      placeholder="Comprehensive description of the product launch or highlight..."
                    />
                  </div>

                  {/* Key Features */}
                  <div className={styles.inputGroup}>
                    <label className={styles.label} style={{ color: '#334155', fontWeight: 'bold' }}>Key Features (one per line)</label>
                    <textarea
                      className={styles.input}
                      style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }}
                      rows={4}
                      value={spotFeaturesText}
                      onChange={e => setSpotFeaturesText(e.target.value)}
                      placeholder={"Life-size 3D model\n20 detachable anatomical parts\nDetailed colour coding & labeling\nDigital reference manual included"}
                    />
                  </div>

                  {/* Product Image Upload & URL */}
                  <div className={styles.inputGroup}>
                    <label className={styles.label} style={{ color: '#334155', fontWeight: 'bold' }}>Product Image</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <label className={styles.uploadBox} style={{ padding: '20px', background: '#f8fafc', border: '2px dashed #cbd5e1' }}>
                        <span className={styles.uploadText} style={{ color: '#475569', fontWeight: '500' }}>Click to upload Product Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className={styles.fileInput}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handleFileUpload(file);
                              if (url) setSpotImageUrl(url);
                            }
                          }}
                        />
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#64748b', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Or Image URL:</span>
                        <input
                          type="text"
                          className={styles.input}
                          style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', flex: 1 }}
                          value={spotImageUrl}
                          onChange={e => setSpotImageUrl(e.target.value)}
                          placeholder="https://... (or /products/...)"
                        />
                      </div>
                      {spotImageUrl && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <img src={spotImageUrl} alt="Preview" style={{ width: '90px', height: '70px', borderRadius: '8px', objectFit: 'contain', background: '#fff', border: '1px solid #cbd5e1' }} />
                          <button type="button" onClick={() => setSpotImageUrl('')} style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
                            Remove Image
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Button Visibility Controls */}
                  <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                      <h4 style={{ margin: 0, color: '#0a8d93', fontSize: '0.95rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Button Controls & Visibility
                      </h4>
                      <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.82rem' }}>
                        Toggle and configure which action buttons appear in the spotlight card.
                      </p>
                    </div>

                    {/* Primary Button */}
                    <div style={{ padding: '16px', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spotShowPrimary ? '14px' : '0' }}>
                        <div>
                          <span style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '0.9rem' }}>Primary CTA Button</span>
                          <span style={{ display: 'block', color: '#64748b', fontSize: '0.78rem' }}>Solid colored highlight button (e.g. View Product)</span>
                        </div>
                        <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer', flexShrink: 0 }}>
                          <input type="checkbox" checked={spotShowPrimary} onChange={e => setSpotShowPrimary(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                          <span style={{ position: 'absolute', inset: 0, borderRadius: '12px', background: spotShowPrimary ? '#0a8d93' : '#cbd5e1', transition: '0.2s' }} />
                          <span style={{ position: 'absolute', top: '2px', left: spotShowPrimary ? '22px' : '2px', width: '20px', height: '20px', background: '#fff', borderRadius: '50%', transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                        </label>
                      </div>
                      {spotShowPrimary && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', paddingTop: '10px', borderTop: '1px dashed #e2e8f0' }}>
                          <div className={styles.inputGroup}>
                            <label className={styles.label} style={{ color: '#475569', fontSize: '0.8rem', fontWeight: 'bold' }}>Button Text</label>
                            <input type="text" className={styles.input} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }} value={spotPrimaryText} onChange={e => setSpotPrimaryText(e.target.value)} placeholder="View Product" />
                          </div>
                          <div className={styles.inputGroup}>
                            <label className={styles.label} style={{ color: '#475569', fontSize: '0.8rem', fontWeight: 'bold' }}>Link Href</label>
                            <input type="text" className={styles.input} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }} value={spotPrimaryHref} onChange={e => setSpotPrimaryHref(e.target.value)} placeholder="/products/..." />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Secondary Button */}
                    <div style={{ padding: '16px', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spotShowSecondary ? '14px' : '0' }}>
                        <div>
                          <span style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '0.9rem' }}>Secondary CTA Button</span>
                          <span style={{ display: 'block', color: '#64748b', fontSize: '0.78rem' }}>Outlined button for brochures/catalogues</span>
                        </div>
                        <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer', flexShrink: 0 }}>
                          <input type="checkbox" checked={spotShowSecondary} onChange={e => setSpotShowSecondary(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                          <span style={{ position: 'absolute', inset: 0, borderRadius: '12px', background: spotShowSecondary ? '#0a8d93' : '#cbd5e1', transition: '0.2s' }} />
                          <span style={{ position: 'absolute', top: '2px', left: spotShowSecondary ? '22px' : '2px', width: '20px', height: '20px', background: '#fff', borderRadius: '50%', transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                        </label>
                      </div>
                      {spotShowSecondary && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', paddingTop: '10px', borderTop: '1px dashed #e2e8f0' }}>
                          <div className={styles.inputGroup}>
                            <label className={styles.label} style={{ color: '#475569', fontSize: '0.8rem', fontWeight: 'bold' }}>Button Text</label>
                            <input type="text" className={styles.input} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }} value={spotSecondaryText} onChange={e => setSpotSecondaryText(e.target.value)} placeholder="Download Catalogue" />
                          </div>
                          <div className={styles.inputGroup}>
                            <label className={styles.label} style={{ color: '#475569', fontSize: '0.8rem', fontWeight: 'bold' }}>Download URL / Link</label>
                            <input type="text" className={styles.input} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }} value={spotSecondaryHref} onChange={e => setSpotSecondaryHref(e.target.value)} placeholder="https://... or /catalogue.pdf" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quote Button */}
                    <div style={{ padding: '16px', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spotShowQuote ? '14px' : '0' }}>
                        <div>
                          <span style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '0.9rem' }}>Quote Request Button</span>
                          <span style={{ display: 'block', color: '#64748b', fontSize: '0.78rem' }}>Opens interactive quote dialog or contact page</span>
                        </div>
                        <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer', flexShrink: 0 }}>
                          <input type="checkbox" checked={spotShowQuote} onChange={e => setSpotShowQuote(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                          <span style={{ position: 'absolute', inset: 0, borderRadius: '12px', background: spotShowQuote ? '#0a8d93' : '#cbd5e1', transition: '0.2s' }} />
                          <span style={{ position: 'absolute', top: '2px', left: spotShowQuote ? '22px' : '2px', width: '20px', height: '20px', background: '#fff', borderRadius: '50%', transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                        </label>
                      </div>
                      {spotShowQuote && (
                        <div style={{ paddingTop: '10px', borderTop: '1px dashed #e2e8f0' }}>
                          <div className={styles.inputGroup}>
                            <label className={styles.label} style={{ color: '#475569', fontSize: '0.8rem', fontWeight: 'bold' }}>Button Text</label>
                            <input type="text" className={styles.input} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a' }} value={spotQuoteText} onChange={e => setSpotQuoteText(e.target.value)} placeholder="Request a Quote" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Form Submit & Cancel Buttons */}
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                    <button
                      type="button"
                      onClick={resetSpotlightForm}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending || uploadingFile}
                      style={{ background: '#0a8d93', color: '#ffffff', border: 'none', padding: '10px 28px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 8px rgba(10, 141, 147, 0.25)' }}
                    >
                      {isPending ? 'Saving...' : editingSpotlight ? 'Update Spotlight' : 'Create Spotlight'}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Spotlight Cards Grid List */}
              {loadingData ? (
                <p>Loading spotlights...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {spotlightList.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
                      {spotlightList.map((spot) => (
                        <div
                          key={spot._id}
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
                          {/* Image preview & badges */}
                          <div style={{ position: 'relative', height: '180px', background: '#f8fafc', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #e2e8f0' }}>
                            {spot.imageUrl ? (
                              <img
                                src={spot.imageUrl}
                                alt={spot.title}
                                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '16px' }}
                              />
                            ) : (
                              <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#cbd5e1' }}>inventory_2</span>
                            )}
                            <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px' }}>
                              <span style={{ background: spot.isActive ? '#0a8d93' : '#64748b', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                {spot.isActive ? 'Active on Homepage' : 'Hidden'}
                              </span>
                              {spot.badge && (
                                <span style={{ background: '#f0fdfa', border: '1px solid #99f6e4', color: '#0d9488', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                  {spot.badge}
                                </span>
                              )}
                            </div>
                            <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(15, 23, 42, 0.75)', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              Order: {spot.displayOrder || 0}
                            </div>
                          </div>

                          {/* Content */}
                          <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                              {spot.title}
                            </h4>
                            {spot.subtitle && (
                              <p style={{ color: '#0a8d93', fontSize: '0.85rem', fontWeight: '600', margin: 0 }}>
                                {spot.subtitle}
                              </p>
                            )}
                            {spot.description && (
                              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0', lineHeight: 1.5 }}>
                                {spot.description}
                              </p>
                            )}

                            {/* Features Preview */}
                            {spot.features && spot.features.length > 0 && (
                              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {spot.features.slice(0, 3).map((f: string, idx: number) => (
                                  <span key={idx} style={{ background: '#f1f5f9', color: '#334155', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px' }}>
                                    ✓ {f}
                                  </span>
                                ))}
                                {spot.features.length > 3 && (
                                  <span style={{ color: '#64748b', fontSize: '0.72rem', alignSelf: 'center' }}>
                                    +{spot.features.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Active buttons indicator */}
                            <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {spot.showPrimaryBtn && (
                                <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                  Btn: {spot.primaryBtnText || 'View'}
                                </span>
                              )}
                              {spot.showSecondaryBtn && (
                                <span style={{ background: '#f3e8ff', color: '#7e22ce', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                  Btn: {spot.secondaryBtnText || 'Catalogue'}
                                </span>
                              )}
                              {spot.showQuoteBtn && (
                                <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                  Btn: {spot.quoteBtnText || 'Quote'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Card Actions */}
                          <div style={{ padding: '16px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px' }}>
                            <button
                              type="button"
                              onClick={() => openSpotlightEdit(spot)}
                              style={{
                                flex: 1,
                                background: '#ffffff',
                                border: '1px solid #cbd5e1',
                                color: '#0284c7',
                                padding: '8px',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowConfirmDeleteSpotlightModal(spot._id)}
                              style={{
                                flex: 1,
                                background: '#ffffff',
                                border: '1px solid #fecaca',
                                color: '#ef4444',
                                padding: '8px',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !isCreatingSpotlight ? (
                    <div style={{ textAlign: 'center', padding: '48px 0', background: '#ffffff', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#94a3b8', display: 'block', marginBottom: '12px' }}>stars</span>
                      <p style={{ color: '#475569', fontWeight: '500', margin: 0 }}>No product spotlight configured yet.</p>
                      <button
                        type="button"
                        onClick={() => { resetSpotlightForm(); setIsCreatingSpotlight(true); }}
                        style={{ marginTop: '14px', background: '#0a8d93', color: '#ffffff', border: 'none', padding: '10px 22px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Add Your First Spotlight
                      </button>
                    </div>
                  ) : null}
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
      {/* Edit Subcategory Modal */}
      <AnimatePresence>
        {editingSubcategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(5, 11, 20, 0.75)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px'
            }}
          >
            <motion.form
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onSubmit={handleSubCategoryUpdate}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '560px',
                padding: '32px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                color: '#0f172a'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                  Edit Subcategory
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingSubcategory(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#64748b' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Subcategory Name *
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    value={editSubCategoryName}
                    onChange={(e) => setEditSubCategoryName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Parent Category *
                  </label>
                  <select
                    className={styles.input}
                    value={editSubCategoryCategoryId}
                    onChange={(e) => setEditSubCategoryCategoryId(e.target.value)}
                    required
                  >
                    <option value="">Select Parent Category</option>
                    {categoriesList.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Description
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    value={editSubCategoryDesc}
                    onChange={(e) => setEditSubCategoryDesc(e.target.value)}
                  />
                </div>

                {/* 1. Card Image (800x800) */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>
                      Card Image (800 × 800 px)
                    </label>
                    <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Square 1:1</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 8px 0' }}>
                    Clean square photo for subcategory cards and menus.
                  </p>
                  <label className={styles.uploadBox} style={{ padding: '14px' }}>
                    <span className={styles.uploadText}>Click to replace Card Image (800 × 800)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className={styles.fileInput}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleFileUpload(file);
                          if (url) setEditSubCategoryImgUrl(url);
                        }
                      }}
                    />
                  </label>
                  {editSubCategoryImgUrl && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={editSubCategoryImgUrl} alt="Card Preview" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'contain', border: '1px solid #e2e8f0', background: '#f8fafc', padding: '4px' }} />
                      <button type="button" onClick={() => setEditSubCategoryImgUrl('')} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.82rem' }}>
                        Remove Card Image
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Hero Banner (2040x600) */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>
                      Hero Banner (2040 × 600 px) <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#64748b' }}>(Optional)</span>
                    </label>
                    <span style={{ fontSize: '0.72rem', background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Panoramic</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 8px 0' }}>
                    Wide panoramic banner specifically for the page header when this subcategory is opened.
                  </p>
                  <label className={styles.uploadBox} style={{ padding: '14px' }}>
                    <span className={styles.uploadText}>Click to upload Hero Banner (2040 × 600)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className={styles.fileInput}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleFileUpload(file);
                          if (url) setEditSubCategoryHeroBannerUrl(url);
                        }
                      }}
                    />
                  </label>
                  {editSubCategoryHeroBannerUrl ? (
                    <div style={{ marginTop: '8px', position: 'relative', width: '100%', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                      <img src={editSubCategoryHeroBannerUrl} alt="Hero Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setEditSubCategoryHeroBannerUrl('')}
                        style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '6px 0 0 0' }}>
                      No hero banner set (falls back to Card Image).
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                <button
                  type="submit"
                  disabled={isPending || uploadingFile}
                  style={{ flex: 1, background: '#0a8d93', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {isPending ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSubcategory(null)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Subcategory Modal */}
      <AnimatePresence>
        {showConfirmDeleteSubcategoryModal && (
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
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#49D3E7', marginBottom: '16px' }}>help</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px', color: '#49D3E7', fontFamily: 'var(--font-sans)' }}>Confirm Deletion</h3>
              <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: '1.6', marginBottom: '28px', fontFamily: 'var(--font-sans)' }}>
                Are you sure you want to delete this subcategory? Products in this subcategory will remain in their parent category.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowConfirmDeleteSubcategoryModal(null)}
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
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => confirmDeleteSubcategory(showConfirmDeleteSubcategoryModal)}
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
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Confirm Delete Solution Modal */}
      <AnimatePresence>
        {showConfirmDeleteSolutionModal && (
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
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#49D3E7', marginBottom: '16px' }}>help</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px', color: '#49D3E7', fontFamily: 'var(--font-sans)' }}>Confirm Deletion</h3>
              <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: '1.6', marginBottom: '28px', fontFamily: 'var(--font-sans)' }}>
                Are you sure you want to delete this solution card? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowConfirmDeleteSolutionModal(null)}
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
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => confirmDeleteSolution(showConfirmDeleteSolutionModal)}
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
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Spotlight Modal */}
      <AnimatePresence>
        {showConfirmDeleteSpotlightModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(5, 11, 20, 0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setShowConfirmDeleteSpotlightModal(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(145deg, #0d1b2a, #0a1628)',
                border: '1px solid rgba(73, 211, 231, 0.2)',
                borderRadius: '20px',
                maxWidth: '440px',
                width: '100%',
                padding: '32px',
                textAlign: 'center',
                color: '#E2E8F0'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#49D3E7', marginBottom: '16px' }}>help</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '12px', color: '#49D3E7', fontFamily: 'var(--font-sans)' }}>Confirm Deletion</h3>
              <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: '1.6', marginBottom: '28px', fontFamily: 'var(--font-sans)' }}>
                Are you sure you want to delete this spotlight? This will remove it from the homepage immediately.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowConfirmDeleteSpotlightModal(null)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#94A3B8', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => confirmDeleteSpotlight(showConfirmDeleteSpotlightModal)}
                  style={{ flex: 1, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
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

