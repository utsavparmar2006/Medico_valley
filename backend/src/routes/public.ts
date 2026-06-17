import express from 'express';
import Category from '../models/Category';
import Product from '../models/Product';

const router = express.Router();

// 1. Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    const data = await Promise.all(categories.map(async (cat) => {
      const count = await Product.countDocuments({ category: cat._id, isActive: true });
      return {
        ...cat.toObject(),
        productCount: count
      };
    }));
    return res.json({ success: true, data });
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
router.get('/categories/:categorySlug/products', async (req, res) => {
  const { categorySlug } = req.params;

  try {
    const category = await Category.findOne({ slug: categorySlug.toLowerCase().trim() });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const products = await Product.find({ category: category._id, isActive: true })
      .populate('category', 'name slug')
      .sort({ name: 1 });

    return res.json({
      success: true,
      category: {
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
      data: products,
    });
  } catch (error: any) {
    console.error('Fetch category products error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// 4. Get product details by productSlug
router.get('/products/:productSlug', async (req, res) => {
  const { productSlug } = req.params;

  try {
    const product = await Product.findOne({ slug: productSlug.toLowerCase().trim(), isActive: true })
      .populate('category', 'name slug description');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({ success: true, data: product });
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
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: products });
  } catch (error: any) {
    console.error('Fetch all products error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
