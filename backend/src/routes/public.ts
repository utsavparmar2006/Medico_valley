import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import Category from '../models/Category';
import Product from '../models/Product';
import Rating from '../models/Rating';
import Inquiry from '../models/Inquiry';
import DeltaDifferenceCard from '../models/DeltaDifferenceCard';
import { sendEmail } from '../utils/email';
import Blog from '../models/Blog';
import Client from '../models/Client';
import Sector from '../models/Sector';

const router = express.Router();

const DEFAULT_SECTORS = [
  {
    title: 'Anatomy Lab',
    desc: 'Advanced human anatomy models, clinical skill task trainers, and high-fidelity patient simulators tailored for MBBS and MD labs.',
    defaultImg: '/labs/anatomy_default.png',
    hoverImg: '/labs/anatomy_hover.png',
    linkUrl: '/products',
    displayOrder: 1,
  },
  {
    title: 'Homeopathy Lab',
    desc: 'Specialized embryology models, pathology charts, and organ-specific physiology units designed for BHMS student labs.',
    defaultImg: '/labs/homeopathy_default.png',
    hoverImg: '/labs/homeopathy_hover.png',
    linkUrl: '/products',
    displayOrder: 2,
  },
  {
    title: 'Nursing Skills Lab',
    desc: 'Comprehensive patient care mannequins, injection simulators, and practical competency kits for nursing curriculum skills.',
    defaultImg: '/labs/nursing_default.png',
    hoverImg: '/labs/nursing_hover.png',
    linkUrl: '/products',
    displayOrder: 3,
  },
  {
    title: 'Ayurvedic Lab',
    desc: 'Traditional anatomical representations, core model structures, and specialized teaching frameworks.',
    defaultImg: '/labs/ayurvedic_default.png',
    hoverImg: '/labs/ayurvedic_hover.png',
    linkUrl: '/products',
    displayOrder: 4,
  },
];

const DEFAULT_CLIENTS = [
  {
    name: 'Bharati Vidyapeeth Deemed University',
    location: 'Pune',
    testimonial: 'Medico Valley\'s advanced simulation technology has significantly enhanced our training capabilities with the latest simulation models.',
    type: 'Medical University',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBs1TJS_og_wI-Vgf8amUYZ8jMOJXbvvzhkgtYWdpXQ41nUoq34vTzrXjerJGX04Wx_PPJI2jJurr9BajPereCDYAzIYKr0QBmXHQexjwrDJBZrMBbZMd9c4UHX1gtem_oMMPzbsUzRhbjrMBnjTePZubZOJAGHB9FO5WPFiLHdNyEC0mizXsFRj0GWZhQrOJ936uRrT2rGwO0Cs3WVFmWSPXCmN2_cFfVLe1l_XpJVaprHkIrPpqxwnTFLPV9a9QOWacr_gK8RK-jY',
    displayOrder: 1,
  },
  {
    name: 'KD Hospital',
    location: 'Ahmedabad',
    testimonial: 'The high-fidelity simulators provided by Medico Valley offer our clinicians a highly realistic training environment, drastically improving procedural outcomes.',
    type: 'Hospital',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBs1TJS_og_wI-Vgf8amUYZ8jMOJXbvvzhkgtYWdpXQ41nUoq34vTzrXjerJGX04Wx_PPJI2jJurr9BajPereCDYAzIYKr0QBmXHQexjwrDJBZrMBbZMd9c4UHX1gtem_oMMPzbsUzRhbjrMBnjTePZubZOJAGHB9FO5WPFiLHdNyEC0mizXsFRj0GWZhQrOJ936uRrT2rGwO0Cs3WVFmWSPXCmN2_cFfVLe1l_XpJVaprHkIrPpqxwnTFLPV9a9QOWacr_gK8RK-jY',
    displayOrder: 2,
  },
  {
    name: 'Pramukhswami Medical College',
    location: 'Karamsad',
    testimonial: 'Their customer support and high-fidelity anatomical models are second to none. Our students have gained incredible clinical confidence.',
    type: 'Medical College',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBs1TJS_og_wI-Vgf8amUYZ8jMOJXbvvzhkgtYWdpXQ41nUoq34vTzrXjerJGX04Wx_PPJI2jJurr9BajPereCDYAzIYKr0QBmXHQexjwrDJBZrMBbZMd9c4UHX1gtem_oMMPzbsUzRhbjrMBnjTePZubZOJAGHB9FO5WPFiLHdNyEC0mizXsFRj0GWZhQrOJ936uRrT2rGwO0Cs3WVFmWSPXCmN2_cFfVLe1l_XpJVaprHkIrPpqxwnTFLPV9a9QOWacr_gK8RK-jY',
    displayOrder: 3,
  },
  {
    name: 'All India Institute of Medical Sciences',
    location: 'New Delhi',
    testimonial: 'Top-tier simulators and excellent service. Medico Valley is our trusted partner in setting up state-of-the-art simulation labs.',
    type: 'Medical Institute',
    logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBs1TJS_og_wI-Vgf8amUYZ8jMOJXbvvzhkgtYWdpXQ41nUoq34vTzrXjerJGX04Wx_PPJI2jJurr9BajPereCDYAzIYKr0QBmXHQexjwrDJBZrMBbZMd9c4UHX1gtem_oMMPzbsUzRhbjrMBnjTePZubZOJAGHB9FO5WPFiLHdNyEC0mizXsFRj0GWZhQrOJ936uRrT2rGwO0Cs3WVFmWSPXCmN2_cFfVLe1l_XpJVaprHkIrPpqxwnTFLPV9a9QOWacr_gK8RK-jY',
    displayOrder: 4,
  },
];

// Get all sectors sorted by displayOrder
router.get('/sectors', async (req, res) => {
  try {
    let sectors = await Sector.find({}).sort({ displayOrder: 1 });
    if (sectors.length === 0) {
      await Sector.insertMany(DEFAULT_SECTORS);
      sectors = await Sector.find({}).sort({ displayOrder: 1 });
    }
    return res.json({ success: true, data: sectors });
  } catch (error: any) {
    console.error('Fetch sectors error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get active Delta Difference cards sorted by displayOrder
router.get('/delta-difference', async (req, res) => {
  try {
    const cards = await DeltaDifferenceCard.find({ isActive: true }).sort({ displayOrder: 1 });
    return res.json({ success: true, data: cards });
  } catch (error: any) {
    console.error('Fetch delta difference cards error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// 1. Get all categories (with optional offset pagination)
router.get('/categories', async (req, res) => {
  const page = Math.max(Number(req.query.page) || 0, 0);
  const limit = Math.min(Math.max(Number(req.query.limit) || 0, 0), 48);

  try {
    const query = {};
    const categoriesQuery = Category.find(query).sort({ name: 1 });

    if (page > 0 && limit > 0) {
      categoriesQuery.skip((page - 1) * limit).limit(limit);
    }

    const [categories, total] = await Promise.all([
      categoriesQuery,
      Category.countDocuments(query),
    ]);

    // Fetch the first active product's image for each category to display on category cards
    const data = await Promise.all(
      categories.map(async (cat) => {
        const firstProd = await Product.findOne({ category: cat._id, isActive: true })
          .select('mediaUrls')
          .sort({ name: 1 });
        const productImage = firstProd?.mediaUrls?.[0] || cat.imageUrl || '';
        return {
          ...cat.toObject(),
          productImage,
        };
      })
    );

    return res.json({
      success: true,
      data,
      pagination: page > 0 && limit > 0 ? {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      } : undefined,
    });
  } catch (error: any) {
    console.error('Fetch categories error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// 2. Get category details by slug
router.get('/categories/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const category = await Category.findOne({ slug: slug.toLowerCase().trim() });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.json({ success: true, data: category });
  } catch (error: any) {
    console.error('Fetch category details error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// 3. Get products under a category by categorySlug
// Get all top clients (public with auto-seeding)
router.get('/clients', async (req, res) => {
  try {
    const count = await Client.countDocuments();
    if (count === 0) {
      await Client.insertMany(DEFAULT_CLIENTS);
    }
    const clients = await Client.find({}).sort({ displayOrder: 1 });
    return res.json({ success: true, data: clients });
  } catch (error: any) {
    console.error('Fetch public clients error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

router.get('/categories/:categorySlug/products', async (req, res) => {
  const { categorySlug } = req.params;
  const page = Math.max(Number(req.query.page) || 0, 0);
  const limit = Math.min(Math.max(Number(req.query.limit) || 0, 0), 48);

  try {
    const category = await Category.findOne({ slug: categorySlug.toLowerCase().trim() });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const query = { category: category._id, isActive: true };
    const productsQuery = Product.find(query)
      .populate('category', 'name slug')
      .sort({ name: 1 });

    if (page > 0 && limit > 0) {
      productsQuery.skip((page - 1) * limit).limit(limit);
    }

    const [products, total] = await Promise.all([
      productsQuery,
      Product.countDocuments(query),
    ]);

    return res.json({
      success: true,
      category: {
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
      data: products,
      pagination: page > 0 && limit > 0 ? {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      } : undefined,
    });
  } catch (error: any) {
    console.error('Fetch category products error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Deterministic baseline generator matching the client implementation
const getProductRatingBaseline = (productId: string) => {
  const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseAvg = parseFloat((4.3 + (hash % 7) * 0.1).toFixed(1));
  const baseCount = 120 + (hash % 73) * 8;
  return { baseAvg, baseCount };
};

// Calculate combined rating (baseline + real votes)
const getCombinedRating = async (productId: string) => {
  const { baseAvg, baseCount } = getProductRatingBaseline(productId);

  const realRatings = await Rating.find({ productId: new mongoose.Types.ObjectId(productId) });
  const realCount = realRatings.length;

  if (realCount === 0) {
    return {
      ratingAverage: baseAvg,
      ratingCount: baseCount,
    };
  }

  const realSum = realRatings.reduce((sum, r) => sum + r.rating, 0);
  const totalCount = baseCount + realCount;
  const totalSum = (baseAvg * baseCount) + realSum;
  const ratingAverage = parseFloat((totalSum / totalCount).toFixed(1));

  return {
    ratingAverage,
    ratingCount: totalCount,
  };
};

// 4. Get product details by productSlug
router.get('/products/:productSlug', async (req, res) => {
  const { productSlug } = req.params;

  try {
    const product = await Product.findOne({ slug: productSlug.toLowerCase().trim(), isActive: true })
      .populate('category', 'name slug description');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productData = product.toObject() as any;
    const info = await getCombinedRating(product._id.toString());
    productData.ratingAverage = info.ratingAverage;
    productData.ratingCount = info.ratingCount;

    return res.json({ success: true, data: productData });
  } catch (error: any) {
    console.error('Fetch product details error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// 5. Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('category', 'name slug')
      .sort({ createdAt: 1 });
    return res.json({ success: true, data: products });
  } catch (error: any) {
    console.error('Fetch all products error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// 6. Get product rating info
router.get('/products/:productId/rating-info', async (req, res) => {
  const { productId } = req.params;
  const { visitorId } = req.query;

  try {
    const info = await getCombinedRating(productId);
    
    let userRating = null;
    if (visitorId) {
      const ratingDoc = await Rating.findOne({ 
        productId: new mongoose.Types.ObjectId(productId), 
        visitorId: String(visitorId) 
      });
      if (ratingDoc) {
        userRating = ratingDoc.rating;
      }
    }

    return res.json({
      success: true,
      ratingAverage: info.ratingAverage,
      ratingCount: info.ratingCount,
      userRating,
    });
  } catch (error: any) {
    console.error('Fetch rating-info error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// 7. Submit or update product rating
router.post('/products/:productId/rate', async (req, res) => {
  const { productId } = req.params;
  const { visitorId, rating } = req.body;

  if (!visitorId || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Invalid rating parameters' });
  }

  try {
    await Rating.findOneAndUpdate(
      { 
        productId: new mongoose.Types.ObjectId(productId), 
        visitorId: String(visitorId) 
      },
      { rating },
      { upsert: true, new: true }
    );

    const info = await getCombinedRating(productId);

    return res.json({
      success: true,
      ratingAverage: info.ratingAverage,
      ratingCount: info.ratingCount,
      userRating: rating,
    });
  } catch (error: any) {
    console.error('Submit rating error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Helper to sanitize HTML content to prevent email injection
const sanitizeHTML = (str: string) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// 8. Create a quote request inquiry
router.post('/inquiries', async (req, res) => {
  const {
    productId,
    productName,
    category,
    customerName,
    institution,
    email,
    phone,
    city,
    message,
  } = req.body;

  if (
    !productId ||
    !productName ||
    !category ||
    !customerName ||
    !institution ||
    (!email && !phone) ||
    !city
  ) {
    return res.status(400).json({ message: 'All required fields (including either Email or Phone Number) must be filled' });
  }

  try {
    const inquiry = await Inquiry.create({
      productId: new mongoose.Types.ObjectId(productId),
      productName,
      category,
      customerName,
      institution,
      email,
      phone: phone || '',
      city,
      message,
      status: 'Pending',
    });

    // Fetch Product with populated category details to enrich the quote request context
    const product = await Product.findById(productId).populate('category');

    // Extract metadata
    const productSlug = product ? product.slug : '';
    const productCategory = product && (product.category as any) ? (product.category as any).name : category;
    const categorySlug = product && (product.category as any) ? (product.category as any).slug : '';
    const productImage = product && product.mediaUrls && product.mediaUrls.length > 0 ? product.mediaUrls[0] : '';

    const isDev = process.env.NODE_ENV === 'development';
    const siteUrl = process.env.FRONTEND_URL || (isDev ? 'http://localhost:3000' : 'https://medicovalley.com');
    const backendUrl = process.env.BACKEND_URL || (isDev ? 'http://localhost:5000' : 'https://medicovalley.com');

    const absoluteProductUrl = productSlug && categorySlug ? `${siteUrl}/products/${categorySlug}/${productSlug}` : '';

    let absoluteProductImage = '';
    let hasEmbeddedImage = false;
    const attachments: any[] = [];

    if (productImage) {
      // Normalize absolute localhost URLs (saved during dashboard uploads) back to relative paths
      let imagePathForResolution = productImage;
      if (productImage.startsWith('http://localhost:5000') || productImage.startsWith('http://127.0.0.1:5000')) {
        imagePathForResolution = productImage.replace(/https?:\/\/(localhost|127\.0\.0\.1):5000/, '');
      } else if (productImage.startsWith('http://localhost:3000') || productImage.startsWith('http://127.0.0.1:3000')) {
        imagePathForResolution = productImage.replace(/https?:\/\/(localhost|127\.0\.0\.1):3000/, '');
      } else if (backendUrl && productImage.startsWith(backendUrl)) {
        imagePathForResolution = productImage.substring(backendUrl.length);
      } else if (siteUrl && productImage.startsWith(siteUrl)) {
        imagePathForResolution = productImage.substring(siteUrl.length);
      }

      if (imagePathForResolution.startsWith('http')) {
        // External URLs (e.g. Google images, etc.) - keep as-is
        absoluteProductImage = imagePathForResolution;
      } else {
        // Local relative paths
        const normalizedPath = imagePathForResolution.startsWith('/') ? imagePathForResolution : `/${imagePathForResolution}`;
        let localFilePath = '';
        if (normalizedPath.startsWith('/uploads')) {
          const filename = normalizedPath.substring('/uploads/'.length);
          localFilePath = path.join(__dirname, '../../uploads', filename);
          absoluteProductImage = `${backendUrl}${normalizedPath}`;
        } else {
          localFilePath = path.join(__dirname, '../../../frontend/public', normalizedPath);
          absoluteProductImage = `${siteUrl}${normalizedPath}`;
        }

        if (localFilePath && fs.existsSync(localFilePath)) {
          attachments.push({
            filename: path.basename(localFilePath),
            path: localFilePath,
            cid: 'productImage'
          });
          hasEmbeddedImage = true;
        }
      }
      // URL-encode to handle spaces (like '/anatommy model/') in image paths
      absoluteProductImage = encodeURI(absoluteProductImage);
    }

    const formattedDate = new Date(inquiry.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const formattedTime = new Date(inquiry.createdAt).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const isGeneralInquiry = category === 'General Inquiry';
    let emailText = '';
    let emailHtml = '';

    const mailtoBody = `Hello ${customerName},

Thank you for contacting Medico Valley.

We have received your inquiry and appreciate your interest in our products.

Regarding your request, our team is reviewing the details and will get back to you shortly.

If you have any additional requirements, please feel free to let us know.

Best Regards,

Sales Team
Medico Valley
www.medicovalley.com`;

    const encodedMailtoBody = encodeURIComponent(mailtoBody);
    const mailtoUrl = email 
      ? `mailto:${email}?subject=Re:%20Your%20Inquiry%20to%20Medico%20Valley&body=${encodedMailtoBody}`
      : `mailto:?subject=Re:%20Your%20Inquiry%20to%20Medico%20Valley&body=${encodedMailtoBody}`;

    const safeCustomerName = sanitizeHTML(customerName);
    const safeEmail = email ? sanitizeHTML(email) : 'Not provided (WhatsApp Contact)';
    const safePhone = phone ? sanitizeHTML(phone) : 'Not provided (Email only)';
    const safeCity = sanitizeHTML(city);
    const safeInstitution = sanitizeHTML(institution);
    const safeProductName = sanitizeHTML(productName);
    const safeCategory = sanitizeHTML(productCategory);
    const safeMessage = sanitizeHTML(message);

    if (isGeneralInquiry) {
      // 1. Construct Plain Text Email Body for Contact Us (Lightweight & Unchanged)
      emailText = `Medico Valley - New Inquiry Received

Inquiry Type: General Contact Message
Customer Name: ${customerName}
Email: ${email}
Phone: ${phone}
City: ${city}
Institution: ${institution}
Product/Subject: ${productName}
Category: ${category}

Customer Message:
--------------------------------------------
${message || 'No additional message.'}
--------------------------------------------

This is an automated notification from the Medico Valley portal.`;

      // 2. Construct HTML Email Body for Contact Us (Lightweight & Unchanged)
      emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #334155;
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
    }
    .wrapper {
      background-color: #f8fafc;
      padding: 20px;
      width: 100%;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }
    .header {
      background: linear-gradient(135deg, #0a8d93, #0b6f78);
      color: #ffffff;
      padding: 32px 24px;
      text-align: center;
    }
    .header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .header p {
      margin: 8px 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 32px 24px;
    }
    .intro {
      font-size: 16px;
      color: #1e293b;
      margin-top: 0;
      margin-bottom: 24px;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .details-table th {
      text-align: left;
      padding: 12px 10px;
      border-bottom: 1px solid #f1f5f9;
      color: #64748b;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      width: 35%;
    }
    .details-table td {
      padding: 12px 10px;
      border-bottom: 1px solid #f1f5f9;
      color: #0f172a;
      font-size: 15px;
      font-weight: 500;
    }
    .details-table a {
      color: #0a8d93;
      text-decoration: none;
      font-weight: 600;
    }
    .message-section {
      margin-top: 24px;
    }
    .message-title {
      font-size: 14px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 10px;
    }
    .message-box {
      background-color: #f1f5f9;
      border-left: 4px solid #0a8d93;
      padding: 16px;
      border-radius: 8px;
      font-size: 14px;
      color: #334155;
      white-space: pre-wrap;
    }
    .footer {
      background-color: #F8FAFC;
      color: #64748B;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      border-top: 1px solid #e2e8f0;
      line-height: 1.6;
    }
    .footer a {
      color: #0891B2;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h2>New Inquiry Received</h2>
        <p>Medico Valley Customer Care Portal</p>
      </div>
      <div class="content">
        <p class="intro">Hello Admin,</p>
        <p>A new inquiry has been successfully logged on the website. Here are the customer details:</p>
        
        <table class="details-table">
          <tr>
            <th>Inquiry Type</th>
            <td style="color: #0a8d93; font-weight: 700;">General Contact Message</td>
          </tr>
          <tr>
            <th>Customer Name</th>
            <td>${safeCustomerName}</td>
          </tr>
          <tr>
            <th>Email Address</th>
            <td>${email ? `<a href="mailto:${safeEmail}">${safeEmail}</a>` : 'Not provided (WhatsApp Contact)'}</td>
          </tr>
          <tr>
            <th>Phone Number</th>
            <td>${safePhone}</td>
          </tr>
          <tr>
            <th>City</th>
            <td>${safeCity}</td>
          </tr>
          <tr>
            <th>Institution</th>
            <td>${safeInstitution}</td>
          </tr>
          <tr>
            <th>Item / Product</th>
            <td>${safeProductName}</td>
          </tr>
          <tr>
            <th>Category</th>
            <td>${safeCategory}</td>
          </tr>
        </table>

        ${safeMessage ? `
          <div class="message-section">
            <div class="message-title">Customer Message Detail</div>
            <div class="message-box">${safeMessage.replace(/\n/g, '<br/>')}</div>
          </div>
        ` : ''}

        <!-- Reply CTA Section -->
        <div style="text-align: center; margin-top: 30px; margin-bottom: 10px;">
          <a href="${mailtoUrl}" target="_blank" style="background-color: #0891B2; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(8, 145, 178, 0.2);">
            📩 Reply to Customer
          </a>
          <p style="font-size: 11px; color: #94A3B8; margin-top: 8px; margin-bottom: 0;">
            For the best customer experience, use the 'Reply to Customer' button instead of Gmail's default Reply.
          </p>
        </div>
      </div>
      <div class="footer">
        <p style="margin: 0 0 16px; font-size: 12px; color: #64748B;">
          This inquiry was automatically generated through the Medico Valley website and has been securely recorded in our customer inquiry system.
        </p>
        <div style="border-top: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0; padding: 10px 0; margin-bottom: 16px; font-size: 11px; color: #64748B;">
          <span style="font-weight: 600;">Inquiry ID:</span> ${inquiry.inquiryId} &nbsp;&bull;&nbsp; 
          <span style="font-weight: 600;">Submitted:</span> ${formattedDate} &bull; ${formattedTime} IST
        </div>
        <p style="margin: 0 0 8px; font-weight: 700; color: #0F172A; font-size: 13px;">
          Medico Valley
        </p>
        <p style="margin: 0 0 16px; font-size: 11px; color: #64748B;">
          Website: <a href="https://medicovalley.com" target="_blank">https://medicovalley.com</a> &nbsp;|&nbsp; 
          Email: <a href="mailto:sales@medicovalley.com">sales@medicovalley.com</a> &nbsp;|&nbsp; 
          Phone: <a href="tel:+919876543210">+91 98765 43210</a>
        </p>
        <p style="margin: 0; font-size: 11px; color: #94A3B8;">
          &copy; 2026 Medico Valley. All Rights Reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
    } else {
      // 3. Construct Plain Text Email Body for Product Request Quote (B2B Premium)
      emailText = `Medico Valley - New Product Quote Request

Inquiry ID: ${inquiry.inquiryId}
Submitted: ${formattedDate} at ${formattedTime}
Status: Pending

--- Customer Details ---
Customer Name: ${customerName}
Institution: ${institution}
Email: ${email}
Phone: ${phone}
City: ${city}

--- Product Details ---
Item Name: ${productName}
Category: ${productCategory}

--- Customer Notes ---
${message || 'No additional message.'}

--- Quick Actions ---
Reply Customer: mailto:${email}
Call Customer: tel:${phone}
View Product: ${absoluteProductUrl}
Open Admin Dashboard: ${siteUrl}/admin/dashboard?tab=inquiries

This inquiry was submitted through the MedicoValley website. Reply directly to this email to contact the customer.`;

      // 4. Construct Premium B2B HTML Email Body
      emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Quote Request</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #334155;
      margin: 0;
      padding: 0;
      background-color: #F8FAFC;
    }
    .wrapper {
      background-color: #F8FAFC;
      padding: 30px 15px;
      width: 100%;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #E2E8F0;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #0891B2, #06B6D4);
      color: #ffffff;
      padding: 32px 24px;
      text-align: center;
    }
    .header h2 {
      margin: 0;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.03em;
      text-transform: uppercase;
    }
    .header p {
      margin: 8px 0 0;
      font-size: 12px;
      font-weight: 600;
      color: #E0F7FA;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .content {
      padding: 30px 24px;
    }
    .summary-card {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .summary-title {
      font-size: 18px;
      font-weight: 800;
      color: #0F172A;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 12px;
      margin-top: 0;
      margin-bottom: 15px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
    }
    .summary-label {
      color: #64748b;
      font-weight: 600;
    }
    .summary-val {
      color: #0F172A;
      font-weight: 500;
      text-align: right;
    }
    .badge-pending {
      background-color: #FEF3C7;
      color: #D97706;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .section-card {
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #0F172A;
      border-bottom: 1px solid #F1F5F9;
      padding-bottom: 12px;
      margin-top: 0;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
    }
    .details-table td {
      padding: 8px 0;
      border-bottom: 1px solid #F1F5F9;
      font-size: 14px;
    }
    .details-table tr:last-child td {
      border-bottom: none;
    }
    .table-label {
      color: #64748b;
      font-weight: 600;
      width: 35%;
    }
    .table-value {
      color: #0F172A;
      font-weight: 500;
    }
    .table-value a {
      color: #0891B2;
      text-decoration: none;
      font-weight: 600;
    }
    .product-row {
      display: flex;
      margin-top: 5px;
    }
    .product-image {
      width: 90px;
      height: 90px;
      object-fit: cover;
      border-radius: 10px;
      border: 1px solid #E2E8F0;
      margin-right: 15px;
    }
    .product-details {
      flex: 1;
    }
    .product-name {
      font-size: 16px;
      font-weight: 800;
      color: #0F172A;
      margin: 0 0 4px;
    }
    .product-meta {
      font-size: 13px;
      color: #64748b;
      margin: 0 0 8px;
    }
    .product-meta span {
      color: #0891B2;
      font-weight: 600;
    }
    .product-sku {
      font-size: 12px;
      color: #94a3b8;
      margin: 0 0 2px;
    }
    .product-sku span {
      color: #334155;
      font-weight: 600;
    }
    .product-stock {
      font-size: 12px;
      color: #94a3b8;
      margin: 0;
    }
    .product-stock span {
      color: #10B981;
      font-weight: 700;
    }
    .btn-view-product {
      background-color: #0891B2;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      text-decoration: none;
      display: inline-block;
      box-shadow: 0 4px 12px rgba(8, 145, 178, 0.2);
      margin-top: 15px;
      text-align: center;
    }
    .message-card {
      background-color: #F8FAFC;
      border-left: 4px solid #0891B2;
      border-radius: 4px 16px 16px 4px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .message-title {
      font-size: 13px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }
    .message-body {
      font-size: 14px;
      color: #334155;
      line-height: 1.6;
      white-space: pre-wrap;
      margin: 0;
    }
    .actions-card {
      border-top: 1px solid #E2E8F0;
      padding-top: 24px;
      margin-top: 10px;
      text-align: center;
    }
    .actions-title {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }
    .actions-btn-group {
      text-align: center;
    }
    .action-btn {
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 12px;
      text-decoration: none;
      display: inline-block;
      min-width: 110px;
      text-align: center;
      margin: 4px;
    }
    .btn-action-primary {
      background-color: #E0F7FA;
      color: #0891B2;
      border: 1px solid rgba(8, 145, 178, 0.2);
    }
    .btn-action-secondary {
      background-color: #F1F5F9;
      color: #334155;
      border: 1px solid #E2E8F0;
    }
    .footer {
      background-color: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      padding: 24px;
      text-align: center;
    }
    .footer-highlight {
      font-size: 13px;
      font-weight: 600;
      color: #0891B2;
      margin-bottom: 6px;
    }
    .footer-desc {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 15px;
      line-height: 1.5;
    }
    .footer-meta {
      font-size: 11px;
      color: #94A3B8;
      margin-bottom: 6px;
    }
    .footer-meta a {
      color: #64748b;
      text-decoration: none;
      font-weight: 600;
    }
    .footer-copyright {
      font-size: 11px;
      color: #94A3B8;
      font-weight: 500;
      padding-top: 10px;
      border-top: 1px solid #E2E8F0;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      
      <!-- Section 1: Premium Email Header -->
      <div class="header">
        <h2>MedicoValley</h2>
        <p>Healthcare Simulation & Medical Education Solutions</p>
      </div>
      
      <!-- Content Body -->
      <div class="content">
        
        <!-- Section 2: Inquiry Summary Card -->
        <div class="summary-card">
          <h3 class="summary-title">New Product Quote Request</h3>
          <div class="summary-row">
            <span class="summary-label">Inquiry ID</span>
            <span class="summary-val" style="color: #0891B2; font-weight: 700;">${inquiry.inquiryId}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Submitted</span>
            <span class="summary-val">${formattedDate} at ${formattedTime}</span>
          </div>
          <div class="summary-row" style="margin-bottom: 0;">
            <span class="summary-label">Status</span>
            <span class="summary-val"><span class="badge-pending">Pending</span></span>
          </div>
        </div>

        <!-- Section 3: Customer Information Card -->
        <div class="section-card">
          <h3 class="section-title">Customer Information</h3>
          <table class="details-table">
            <tr>
              <td class="table-label">Customer Name</td>
              <td class="table-value" style="font-weight: 600;">${safeCustomerName}</td>
            </tr>
            <tr>
              <td class="table-label">Institution</td>
              <td class="table-value">${safeInstitution}</td>
            </tr>
            <tr>
              <td class="table-label">Email Address</td>
              <td class="table-value">${email ? `<a href="mailto:${safeEmail}">${safeEmail}</a>` : 'Not provided (WhatsApp Contact)'}</td>
            </tr>
            <tr>
              <td class="table-label">Phone Number</td>
              <td class="table-value">${phone ? `<a href="tel:${safePhone}">${safePhone}</a>` : 'Not provided (Email only)'}</td>
            </tr>
            <tr>
              <td class="table-label" style="border-bottom: none;">City</td>
              <td class="table-value" style="border-bottom: none;">${safeCity}</td>
            </tr>
          </table>
        </div>

        <!-- Section 4: Product Details Card -->
        <div class="section-card">
          <h3 class="section-title">Product Details</h3>
          <div class="product-row">
            ${hasEmbeddedImage ? `
            <img class="product-image" src="cid:productImage" alt="${safeProductName}" />
            ` : (absoluteProductImage ? `
            <img class="product-image" src="${absoluteProductImage}" alt="${safeProductName}" />
            ` : '')}
            <div class="product-details">
              <h4 class="product-name">${safeProductName}</h4>
              <p class="product-meta">Category: <span>${safeCategory}</span></p>
            </div>
          </div>
        </div>

        <!-- Section 6: Customer Message (Notes Card) -->
        ${safeMessage ? `
        <div class="message-card">
          <div class="message-title">Customer Notes</div>
          <p class="message-body">${safeMessage}</p>
        </div>
        ` : ''}

        <!-- Section 7: Quick Action Buttons -->
        <div class="actions-card">
          <div class="actions-title">Quick Actions</div>
          <div class="actions-btn-group">
            ${email ? `<a href="${mailtoUrl}" class="action-btn btn-action-primary">📩 Reply to Customer</a>` : ''}
            ${phone ? `<a href="tel:${safePhone}" class="action-btn btn-action-primary">📞 Call Customer</a>` : ''}
            <a href="${siteUrl}/admin/dashboard?tab=inquiries" class="action-btn btn-action-secondary">🖥️ Open Dashboard</a>
          </div>
          <p style="font-size: 11px; color: #94A3B8; margin-top: 10px; margin-bottom: 0; text-align: center;">
            For the best customer experience, use the 'Reply to Customer' button instead of Gmail's default Reply.
          </p>
        </div>

      </div>
      
      <!-- Section 8: Professional Footer -->
      <div class="footer">
        <p style="margin: 0 0 16px; font-size: 12px; color: #64748B;">
          This inquiry was automatically generated through the Medico Valley website and has been securely recorded in our customer inquiry system.
        </p>
        <div style="border-top: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0; padding: 10px 0; margin-bottom: 16px; font-size: 11px; color: #64748B;">
          <span style="font-weight: 600;">Inquiry ID:</span> ${inquiry.inquiryId} &nbsp;&bull;&nbsp; 
          <span style="font-weight: 600;">Submitted:</span> ${formattedDate} &bull; ${formattedTime} IST
        </div>
        <p style="margin: 0 0 8px; font-weight: 700; color: #0F172A; font-size: 13px;">
          Medico Valley
        </p>
        <p style="margin: 0 0 16px; font-size: 11px; color: #64748B;">
          Website: <a href="https://medicovalley.com" target="_blank">https://medicovalley.com</a> &nbsp;|&nbsp; 
          Email: <a href="mailto:sales@medicovalley.com">sales@medicovalley.com</a> &nbsp;|&nbsp; 
          Phone: <a href="tel:+919876543210">+91 98765 43210</a>
        </p>
        <p style="margin: 0; font-size: 11px; color: #94A3B8;">
          &copy; 2026 Medico Valley. All Rights Reserved.
        </p>
      </div>
      
    </div>
  </div>
</body>
</html>`;
    }

    // 3. Trigger Async Mail Send to Avoid Blocking Client Response
    const emailTo = process.env.EMAIL_TO || 'recipient_email@gmail.com';
    const emailSubject = isGeneralInquiry 
      ? `[Contact Us] New General Inquiry from ${customerName}`
      : `[Quote Request] Quote request for ${productName} from ${customerName}`;

    // Validate customer email for Reply-To header
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let replyTo: string | undefined = undefined;
    if (email && typeof email === 'string' && emailRegex.test(email.trim())) {
      replyTo = `"${customerName}" <${email.trim()}>`;
    }

    sendEmail({
      to: emailTo,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
      replyTo,
      attachments,
    }).catch(err => {
      console.error('SMTP Background Email Sending Failed:', err);
    });

    return res.status(201).json({ success: true, data: inquiry });
  } catch (error: any) {
    console.error('Create inquiry error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// ==========================================
// PUBLIC BLOG ENDPOINTS
// ==========================================

// Get all blogs (newest first)
router.get('/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: blogs });
  } catch (error: any) {
    console.error('Fetch blogs error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get a single blog by slug
router.get('/blogs/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const blog = await Blog.findOne({ slug: slug.toLowerCase().trim() });
    if (!blog) {
      return res.status(404).json({ message: 'Blog article not found' });
    }
    return res.json({ success: true, data: blog });
  } catch (error: any) {
    console.error('Fetch blog detail error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// ==========================================
// PUBLIC CLIENTS ENDPOINTS
// ==========================================
router.get('/clients', async (req, res) => {
  try {
    let clients = await Client.find({}).sort({ displayOrder: 1 });
    
    if (clients.length === 0) {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const hostUrl = `${req.protocol}://${req.get('host')}`;

      const defaultData = [
        {
          name: "Bharati Vidyapeeth Deemed University",
          location: "Pune, Maharashtra",
          type: "Educational Institute / University",
          testimonial: "Medico Valley's advanced simulation technology has significantly enhanced our training capabilities with the latest simulation models.",
          displayOrder: 1,
          fileName: "client_bv.svg",
          svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">
  <defs>
    <linearGradient id="bvGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0b1f3a" />
    </linearGradient>
  </defs>
  <g transform="translate(10, 10)">
    <path d="M 40 0 C 65 0, 80 15, 80 50 C 80 85, 40 100, 40 100 C 40 100, 0 85, 0 50 C 0 15, 15 0, 40 0 Z" fill="url(#bvGrad)" />
    <path d="M 20 40 Q 40 15 60 40 Q 50 60 40 50 Q 30 60 20 40 Z" fill="#d97706" />
    <circle cx="40" cy="45" r="12" fill="none" stroke="#ffffff" stroke-width="2.5" />
    <path d="M 35 45 H 45 M 40 40 V 50" stroke="#ffffff" stroke-width="2" />
  </g>
  <text x="105" y="42" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="19" font-weight="800" fill="#0b1f3a" letter-spacing="0.5">BHARATI VIDYAPEETH</text>
  <text x="105" y="65" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#d97706" letter-spacing="3">DEEMED UNIVERSITY</text>
  <text x="105" y="85" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="500" fill="#64748b">Pune Educational Institute/University</text>
</svg>`
        },
        {
          name: "KD Hospital",
          location: "Ahmedabad, Gujarat",
          type: "Super Speciality Hospital",
          testimonial: "The high-fidelity simulators provided by Medico Valley offer our clinicians a highly realistic training environment, drastically improving procedural outcomes.",
          displayOrder: 2,
          fileName: "client_kd.svg",
          svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">
  <defs>
    <linearGradient id="kdGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ea580c" />
      <stop offset="100%" stop-color="#f97316" />
    </linearGradient>
  </defs>
  <g transform="translate(10, 15)">
    <path d="M 60 10 A 35 35 0 0 0 15 45 A 35 35 0 0 0 60 80 C 45 70, 45 20, 60 10 Z" fill="url(#kdGrad)" />
    <path d="M 40 25 H 55 V 10 H 70 V 25 H 85 V 40 H 70 V 55 H 55 V 40 H 40 Z" fill="#dc2626" opacity="0.9" />
  </g>
  <text x="110" y="52" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="38" font-weight="900" fill="#374151" letter-spacing="-1">KD Hospital</text>
  <text x="110" y="78" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="15" font-weight="700" fill="#ea580c" letter-spacing="2">કુસુમ ધીરજલાલ હોસ્પિટલ</text>
</svg>`
        },
        {
          name: "Pramukhswami Medical College",
          location: "Karamsad, Gujarat",
          type: "Medical College & Research",
          testimonial: "Their customer support and high-fidelity anatomical models are second to none. Our students have gained incredible clinical confidence.",
          displayOrder: 3,
          fileName: "client_pmc.svg",
          svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">
  <g transform="translate(20, 15)">
    <circle cx="45" cy="45" r="42" fill="none" stroke="#0f52ba" stroke-width="2" />
    <path d="M 45 3 L 45 87 M 3 45 L 87 45 M 15 15 L 75 75 M 15 75 L 75 15" stroke="#0f52ba" stroke-width="1.5" />
    <path d="M 45 10 L 45 80 M 10 45 L 80 45 M 20 20 L 70 70 M 20 70 L 70 20" stroke="#0f52ba" stroke-width="3" opacity="0.6" />
    <circle cx="45" cy="45" r="28" fill="#ffffff" stroke="#0f52ba" stroke-width="2.5" />
    <path d="M 36 36 H 45 V 54 H 54 M 45 45 H 54 V 36 M 36 54 H 45" stroke="#0f52ba" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
  </g>
  <text x="125" y="44" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="21" font-weight="800" fill="#0f52ba" letter-spacing="0.2">PRAMUKHSWAMI</text>
  <text x="125" y="68" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="800" fill="#0b1f3a" letter-spacing="0.5">MEDICAL COLLEGE</text>
  <text x="125" y="86" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="600" fill="#64748b" letter-spacing="1.2">Affiliated to Bhaikaka University</text>
</svg>`
        },
        {
          name: "All India Institute of Medical Sciences",
          location: "AIIMS, New Delhi",
          type: "Apex Public Medical Institute",
          testimonial: "Top-tier simulators and excellent service. Medico Valley is our trusted partner in setting up state-of-the-art simulation labs.",
          displayOrder: 4,
          fileName: "client_aiims.svg",
          svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">
  <g transform="translate(15, 10)">
    <circle cx="45" cy="50" r="42" fill="#1e3a8a" />
    <path d="M 25 50 L 45 75 L 65 50 Z" fill="#ffffff" />
    <path d="M 45 22 V 75" stroke="#ffffff" stroke-width="4" />
    <path d="M 30 38 H 60" stroke="#ffffff" stroke-width="4" />
    <path d="M 12 50 C 12 75, 45 87, 45 87 C 45 87, 78 75, 78 50" fill="none" stroke="#eab308" stroke-width="3" />
  </g>
  <text x="120" y="48" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="26" font-weight="900" fill="#1e3a8a" letter-spacing="-0.5">A.I.I.M.S.</text>
  <text x="120" y="74" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" fill="#475569" letter-spacing="1.5">NEW DELHI, INDIA</text>
  <text x="120" y="92" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="500" fill="#94a3b8">Premier Apex Medical Institute</text>
</svg>`
        },
        {
          name: "Armed Forces Medical College",
          location: "AFMC, Pune",
          type: "Defense Medical Training Institute",
          testimonial: "Empowering our defense healthcare teams with premium training models. The fidelity and build quality are outstanding.",
          displayOrder: 5,
          fileName: "client_afmc.svg",
          svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">
  <g transform="translate(20, 12)">
    <path d="M 5 0 H 75 V 45 C 75 75, 40 92, 40 92 C 40 92, 5 75, 5 45 Z" fill="#7f1d1d" stroke="#d97706" stroke-width="2.5" />
    <path d="M 15 15 L 65 65" stroke="#d97706" stroke-width="6" />
    <path d="M 65 15 L 15 65" stroke="#d97706" stroke-width="6" />
    <circle cx="40" cy="40" r="10" fill="#ffffff" stroke="#d97706" stroke-width="2" />
  </g>
  <text x="120" y="48" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="30" font-weight="900" fill="#7f1d1d" letter-spacing="-0.5">A.F.M.C.</text>
  <text x="120" y="72" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" fill="#d97706" letter-spacing="2.5">ARMED FORCES MEDICAL COLLEGE</text>
  <text x="120" y="90" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="600" fill="#64748b">Pune, Maharashtra</text>
</svg>`
        },
        {
          name: "Apollo Hospitals Group",
          location: "Chennai, Tamil Nadu",
          type: "Leading Healthcare Network",
          testimonial: "Empowering our nurses and clinical students with standard clinical simulators. The educational impact is highly quantifiable.",
          displayOrder: 6,
          fileName: "client_apollo.svg",
          svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">
  <g transform="translate(20, 15)">
    <circle cx="40" cy="40" r="36" fill="none" stroke="#851c2d" stroke-width="2.5" />
    <path d="M 40 15 C 25 30, 25 50, 40 65 C 55 50, 55 30, 40 15 Z" fill="#851c2d" />
    <path d="M 28 40 H 52 M 40 28 V 52" stroke="#ffffff" stroke-width="3" />
  </g>
  <text x="115" y="48" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="32" font-weight="800" fill="#0b1f3a" letter-spacing="-0.5">Apollo</text>
  <text x="115" y="74" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" fill="#851c2d" letter-spacing="4.5">TOUCHING LIVES • HOSPITALS</text>
</svg>`
        }
      ];

      const seedPromises = defaultData.map(async (d) => {
        const filePath = path.join(uploadsDir, d.fileName);
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, d.svgContent, 'utf-8');
        }
        return Client.create({
          name: d.name,
          location: d.location,
          type: d.type,
          testimonial: d.testimonial,
          displayOrder: d.displayOrder,
          logoUrl: `${hostUrl}/uploads/${d.fileName}`
        });
      });

      await Promise.all(seedPromises);
      clients = await Client.find({}).sort({ displayOrder: 1 });
    }

    return res.json({ success: true, data: clients });
  } catch (error: any) {
    console.error('Fetch clients error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
