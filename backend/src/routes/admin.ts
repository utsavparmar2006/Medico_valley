import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import slugify from 'slugify';
import Admin from '../models/Admin';
import Category from '../models/Category';
import Product from '../models/Product';
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

export default router;
