import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config(); // Load env variables before S3Client reads them
import slugify from 'slugify';
import Admin from '../models/Admin';
import Category from '../models/Category';
import Product from '../models/Product';
import Inquiry from '../models/Inquiry';
import DeltaDifferenceCard from '../models/DeltaDifferenceCard';
import Blog from '../models/Blog';
import Client from '../models/Client';
import Sector from '../models/Sector';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/auth';
import { authMiddleware, AuthenticatedRequest } from '../middlewares/auth';

const router = express.Router();

// 1. Configure AWS S3 Client
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  region: process.env.AWS_REGION || 'ap-south-1',
});

// 2. Configure Multer to upload directly to S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME || '',
    metadata: (_req: Express.Request, file: Express.Multer.File, cb: (error: any, metadata: any) => void) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (_req: Express.Request, file: Express.Multer.File, cb: (error: any, key: string) => void) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `uploads/${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
});

// Helper to check if string is a valid MongoDB ObjectId
const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Admin Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, admin.password!);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(admin._id.toString());
    const refreshToken = generateRefreshToken(admin._id.toString(), admin.tokenVersion || 0);

    // Set Refresh Token in secure httpOnly cookie (expiring in 10 days)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
    });

    return res.json({
      success: true,
      accessToken,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Refresh Access Token
router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is missing' });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired refresh token', tokenExpired: true });
    }

    // Verify admin exists and check tokenVersion
    const admin = await Admin.findById(decoded.adminId);
    if (!admin) {
      return res.status(401).json({ message: 'Admin session not found' });
    }

    if (admin.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ message: 'Session expired or revoked' });
    }

    // Generate new Access Token
    const accessToken = generateAccessToken(decoded.adminId);

    return res.json({
      success: true,
      accessToken,
    });
  } catch (error: any) {
    console.error('Refresh error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Admin Logout
router.post('/logout', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  try {
    if (refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded) {
        // Increment tokenVersion on logout to invalidate all active refresh tokens for this admin
        await Admin.findByIdAndUpdate(decoded.adminId, { $inc: { tokenVersion: 1 } });
      }
    }

    // Clear client-side cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// ==========================================
// ASSETS AND CONTENT MANAGEMENT (PROTECTED)
// ==========================================

// File Upload endpoint
router.post('/upload', authMiddleware, upload.single('file'), (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // S3 URL is returned by multer-s3 as file.location
  const fileUrl = (req.file as any).location;

  return res.json({
    success: true,
    url: fileUrl,
    filename: req.file.originalname,
    mimetype: req.file.mimetype,
  });
});

// Create Category
router.post('/categories', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { name, description, imageUrl } = req.body;

  if (!name || !description || !imageUrl) {
    return res.status(400).json({ message: 'Name, description, and imageUrl are required' });
  }

  try {
    const slug = slugify(name, { lower: true, strict: true });
    
    // Check if category slug already exists
    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'A category with this name or slug already exists' });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      imageUrl,
    });

    return res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    console.error('Create category error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Create Product
router.post('/products', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { name, description, categoryId, mediaUrls, catalogUrl, keyFeatures } = req.body;

  if (!name || !description || !categoryId || !mediaUrls || !Array.isArray(mediaUrls)) {
    return res.status(400).json({ message: 'Name, description, categoryId, and mediaUrls (array) are required' });
  }

  if (!isValidObjectId(categoryId)) {
    return res.status(400).json({ message: 'Invalid Category ID format' });
  }

  try {
    // Verify Category exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Target category does not exist' });
    }

    const slug = slugify(name, { lower: true, strict: true });

    // Check if product slug already exists
    const existing = await Product.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'A product with this name or slug already exists' });
    }

    const product = await Product.create({
      name,
      slug,
      description,
      category: categoryId,
      mediaUrls,
      catalogUrl,
      keyFeatures: Array.isArray(keyFeatures) ? keyFeatures : [],
      isActive: true,
    });

    return res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    console.error('Create product error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Update Category
router.put('/categories/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, imageUrl } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid Category ID format' });
  }

  if (!name || !description || !imageUrl) {
    return res.status(400).json({ message: 'Name, description, and imageUrl are required' });
  }

  try {
    const slug = slugify(name, { lower: true, strict: true });
    const duplicate = await Category.findOne({ slug, _id: { $ne: id } });
    if (duplicate) {
      return res.status(400).json({ message: 'A category with this name or slug already exists' });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name: name.trim(), slug, description: description.trim(), imageUrl },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.json({ success: true, data: category });
  } catch (error: any) {
    console.error('Update category error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Update Product
router.put('/products/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, categoryId, mediaUrls, catalogUrl, keyFeatures } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid Product ID format' });
  }

  if (!name || !description || !categoryId || !Array.isArray(mediaUrls) || mediaUrls.length === 0) {
    return res.status(400).json({ message: 'Name, description, categoryId, and at least one media URL are required' });
  }

  if (!isValidObjectId(categoryId)) {
    return res.status(400).json({ message: 'Invalid Category ID format' });
  }

  try {
    const [categoryExists, duplicate] = await Promise.all([
      Category.findById(categoryId),
      Product.findOne({
        slug: slugify(name, { lower: true, strict: true }),
        _id: { $ne: id },
      }),
    ]);

    if (!categoryExists) {
      return res.status(400).json({ message: 'Target category does not exist' });
    }

    if (duplicate) {
      return res.status(400).json({ message: 'A product with this name or slug already exists' });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        slug: slugify(name, { lower: true, strict: true }),
        description: description.trim(),
        category: categoryId,
        mediaUrls,
        catalogUrl: catalogUrl || undefined,
        keyFeatures: Array.isArray(keyFeatures) ? keyFeatures : [],
      },
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({ success: true, data: product });
  } catch (error: any) {
    console.error('Update product error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Delete Product (protected)
router.delete('/products/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid Product ID format' });
  }

  try {
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Delete Category (protected)
router.delete('/categories/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid Category ID format' });
  }

  try {
    // Check if there are products under this category
    const productsCount = await Product.countDocuments({ category: id });
    if (productsCount > 0) {
      return res.status(400).json({ message: 'Cannot delete category containing active products' });
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Delete category error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// 12. Get all inquiries (protected)
router.get('/inquiries', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const inquiries = await Inquiry.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, data: inquiries });
  } catch (error: any) {
    console.error('Get inquiries error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// 13. Update inquiry status (protected)
router.put('/inquiries/:id/status', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Pending', 'Contacted', 'Quoted', 'Completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const inquiry = await Inquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    return res.json({ success: true, data: inquiry });
  } catch (error: any) {
    console.error('Update inquiry status error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// ==========================================
// DELTA DIFFERENCE CARDS CRUD ROUTES
// ==========================================

// Get all Delta Difference cards (protected)
router.get('/delta-difference', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cards = await DeltaDifferenceCard.find({}).sort({ displayOrder: 1 });
    return res.json({ success: true, data: cards });
  } catch (error: any) {
    console.error('Get admin delta difference cards error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Create a new card (protected)
router.post('/delta-difference', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const count = await DeltaDifferenceCard.countDocuments();
    if (count >= 5) {
      return res.status(400).json({ message: 'You have reached the maximum limit of 5 cards.' });
    }
    const { title, category, description, initials, iconImage, displayOrder, isActive } = req.body;
    if (!title || !category || !description || !initials || displayOrder === undefined) {
      return res.status(400).json({ message: 'Title, category, description, initials, and display order are required.' });
    }
    const newCard = await DeltaDifferenceCard.create({
      title,
      category,
      description,
      initials,
      iconImage,
      displayOrder: Number(displayOrder),
      isActive: isActive !== undefined ? isActive : true
    });
    return res.status(201).json({ success: true, data: newCard });
  } catch (error: any) {
    console.error('Create delta difference card error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Update a card (protected)
router.put('/delta-difference/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid card ID format' });
  }
  try {
    const { title, category, description, initials, iconImage, displayOrder, isActive } = req.body;
    
    // Check if the card exists
    const card = await DeltaDifferenceCard.findById(id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    const updatedCard = await DeltaDifferenceCard.findByIdAndUpdate(
      id,
      {
        title,
        category,
        description,
        initials,
        iconImage,
        displayOrder: displayOrder !== undefined ? Number(displayOrder) : undefined,
        isActive: isActive !== undefined ? isActive : undefined
      },
      { new: true, runValidators: true }
    );
    return res.json({ success: true, data: updatedCard });
  } catch (error: any) {
    console.error('Update delta difference card error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Delete a card (protected)
router.delete('/delta-difference/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid card ID format' });
  }
  try {
    const count = await DeltaDifferenceCard.countDocuments();
    if (count <= 5) {
      return res.status(400).json({ message: 'Minimum 5 cards are required to maintain the homepage layout.' });
    }
    const deleted = await DeltaDifferenceCard.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Card not found' });
    }
    return res.json({ success: true, message: 'Card deleted successfully' });
  } catch (error: any) {
    console.error('Delete delta difference card error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// ==========================================
// ADMIN BLOG ENDPOINTS (PROTECTED)
// ==========================================

// Create Blog Article
router.post('/blogs', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { title, format, subject, readTime, excerpt, imageUrl, content, highlights } = req.body;

  if (!title || !subject || !readTime || !excerpt || !imageUrl || !content) {
    return res.status(400).json({ message: 'Title, subject, readTime, excerpt, imageUrl, and content are required' });
  }

  try {
    const slug = slugify(title, { lower: true, strict: true });
    
    // Check for duplicate slug
    const existing = await Blog.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'A blog post with this title or slug already exists' });
    }

    const blog = await Blog.create({
      title,
      slug,
      format: format || 'blog',
      subject,
      readTime,
      excerpt,
      imageUrl,
      content: Array.isArray(content) ? content : [content],
      highlights: Array.isArray(highlights) ? highlights : [],
    });

    return res.status(201).json({ success: true, data: blog });
  } catch (error: any) {
    console.error('Create blog error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Update Blog Article
router.put('/blogs/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { title, format, subject, readTime, excerpt, imageUrl, content, highlights } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid blog ID format' });
  }

  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog article not found' });
    }

    const updateFields: any = {};
    if (title) {
      updateFields.title = title;
      updateFields.slug = slugify(title, { lower: true, strict: true });
      // Verify slug uniqueness if it changed
      if (updateFields.slug !== blog.slug) {
        const existing = await Blog.findOne({ slug: updateFields.slug });
        if (existing) {
          return res.status(400).json({ message: 'A blog post with this title or slug already exists' });
        }
      }
    }
    if (format) updateFields.format = format;
    if (subject) updateFields.subject = subject;
    if (readTime) updateFields.readTime = readTime;
    if (excerpt) updateFields.excerpt = excerpt;
    if (imageUrl) updateFields.imageUrl = imageUrl;
    if (content) updateFields.content = Array.isArray(content) ? content : [content];
    if (highlights) updateFields.highlights = Array.isArray(highlights) ? highlights : [];

    const updatedBlog = await Blog.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
    return res.json({ success: true, data: updatedBlog });
  } catch (error: any) {
    console.error('Update blog error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Delete Blog Article
router.delete('/blogs/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid blog ID format' });
  }

  try {
    const deleted = await Blog.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Blog article not found' });
    }
    return res.json({ success: true, message: 'Blog article deleted successfully' });
  } catch (error: any) {
    console.error('Delete blog error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// ==========================================
// ADMIN CLIENTS CRUD ENDPOINTS (PROTECTED)
// ==========================================

// Get all clients (protected)
router.get('/clients', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clients = await Client.find({}).sort({ displayOrder: 1 });
    return res.json({ success: true, data: clients });
  } catch (error: any) {
    console.error('Get admin clients error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Create a new client (protected)
router.post('/clients', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { name, location, testimonial, type, logoUrl, displayOrder } = req.body;

  if (!name || !testimonial || !logoUrl) {
    return res.status(400).json({ message: 'Client name, message/testimonial, and logoUrl are required' });
  }

  try {
    const newClient = await Client.create({
      name,
      location: location || '',
      testimonial,
      type: type || '',
      logoUrl,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0
    });
    return res.status(201).json({ success: true, data: newClient });
  } catch (error: any) {
    console.error('Create client error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Update an existing client (protected)
router.put('/clients/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, location, testimonial, type, logoUrl, displayOrder } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid client ID format' });
  }

  try {
    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const updateFields: any = {};
    if (name !== undefined) updateFields.name = name;
    if (location !== undefined) updateFields.location = location;
    if (testimonial !== undefined) updateFields.testimonial = testimonial;
    if (type !== undefined) updateFields.type = type;
    if (logoUrl !== undefined) updateFields.logoUrl = logoUrl;
    if (displayOrder !== undefined) updateFields.displayOrder = Number(displayOrder);

    const updatedClient = await Client.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
    return res.json({ success: true, data: updatedClient });
  } catch (error: any) {
    console.error('Update client error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Delete a client (protected)
router.delete('/clients/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid client ID format' });
  }

  try {
    const deleted = await Client.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Client not found' });
    }
  } catch (error: any) {
    console.error('Delete client error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// ==========================================
// ADMIN SECTORS / LABS CRUD ENDPOINTS (PROTECTED)
// ==========================================

const DEFAULT_ADMIN_SECTORS = [
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

// Get all sectors
router.get('/sectors', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let sectors = await Sector.find({}).sort({ displayOrder: 1 });
    if (sectors.length === 0) {
      await Sector.insertMany(DEFAULT_ADMIN_SECTORS);
      sectors = await Sector.find({}).sort({ displayOrder: 1 });
    }
    return res.json({ success: true, data: sectors });
  } catch (error: any) {
    console.error('Get admin sectors error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Create a new sector
router.post('/sectors', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { title, desc, defaultImg, hoverImg, linkUrl, displayOrder } = req.body;

  if (!title || !desc || !defaultImg) {
    return res.status(400).json({ message: 'Title, short description, and default image URL are required' });
  }

  if (title.length > 40) {
    return res.status(400).json({ message: 'Title cannot exceed 40 characters' });
  }

  if (desc.length > 180) {
    return res.status(400).json({ message: 'Short description cannot exceed 180 characters' });
  }

  try {
    const count = await Sector.countDocuments();
    if (count >= 4) {
      return res.status(400).json({ message: 'Maximum limit of 4 sector cards reached. Edit or delete an existing card to add a new one.' });
    }
    const newSector = await Sector.create({
      title: title.trim(),
      desc: desc.trim(),
      defaultImg,
      hoverImg: hoverImg || '',
      linkUrl: linkUrl || '/products',
      displayOrder: Number(displayOrder) || 0,
    });

    return res.status(201).json({ success: true, data: newSector });
  } catch (error: any) {
    console.error('Create sector error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Update a sector
router.put('/sectors/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { title, desc, defaultImg, hoverImg, linkUrl, displayOrder } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid sector ID format' });
  }

  try {
    const sector = await Sector.findById(id);
    if (!sector) {
      return res.status(404).json({ message: 'Sector not found' });
    }

    if (title && title.length > 40) {
      return res.status(400).json({ message: 'Title cannot exceed 40 characters' });
    }

    if (desc && desc.length > 180) {
      return res.status(400).json({ message: 'Short description cannot exceed 180 characters' });
    }

    const updateFields: any = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (desc !== undefined) updateFields.desc = desc.trim();
    if (defaultImg !== undefined) updateFields.defaultImg = defaultImg;
    if (hoverImg !== undefined) updateFields.hoverImg = hoverImg;
    if (linkUrl !== undefined) updateFields.linkUrl = linkUrl;
    if (displayOrder !== undefined) updateFields.displayOrder = Number(displayOrder);

    const updatedSector = await Sector.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
    return res.json({ success: true, data: updatedSector });
  } catch (error: any) {
    console.error('Update sector error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Delete a sector
router.delete('/sectors/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid sector ID format' });
  }

  try {
    const deleted = await Sector.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Sector not found' });
    }
    return res.json({ success: true, message: 'Sector deleted successfully' });
  } catch (error: any) {
    console.error('Delete sector error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
