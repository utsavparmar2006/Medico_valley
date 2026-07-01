import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import slugify from 'slugify';
import Admin from '../models/Admin';
import Category from '../models/Category';
import Product from '../models/Product';
import Inquiry from '../models/Inquiry';
import DeltaDifferenceCard from '../models/DeltaDifferenceCard';
import Blog from '../models/Blog';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/auth';
import { authMiddleware, AuthenticatedRequest } from '../middlewares/auth';

const router = express.Router();

// 1. Configure Multer for local storage upload
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // limit to 100MB for video assets
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

  // Generate public file url pointing to local backend static server
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  return res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
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
  const { name, description, categoryId, mediaUrls, catalogUrl } = req.body;

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
  const { name, description, categoryId, mediaUrls, catalogUrl } = req.body;

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

export default router;
