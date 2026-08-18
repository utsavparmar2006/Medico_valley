import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import slugify from 'slugify';
import XLSX from 'xlsx';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import Category from '../models/Category';
import Subcategory from '../models/Subcategory';
import Product from '../models/Product';

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || '';

async function runSeed() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB Atlas successfully!\n');

  const excelPath = path.join(__dirname, '../../../MedicoValley_Product_Catalogue_Final_Taxonomy (1).xlsx');
  console.log('Reading taxonomy Excel file:', excelPath);

  const workbook = XLSX.readFile(excelPath);
  const rows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  console.log(`Loaded ${rows.length} rows from Excel.\n`);

  // Fetch parent categories
  const categories = await Category.find({});
  const categoryMap: Record<string, any> = {};

  categories.forEach((cat) => {
    categoryMap[cat.slug] = cat;
    categoryMap[cat.name.toLowerCase().trim()] = cat;
  });

  // Map alternative category names from Excel
  if (categoryMap['task-trainers']) {
    categoryMap['task trainer'] = categoryMap['task-trainers'];
    categoryMap['task trainers'] = categoryMap['task-trainers'];
  }
  if (categoryMap['anatomy-models']) {
    categoryMap['anatomy models'] = categoryMap['anatomy-models'];
  }
  if (categoryMap['medical-simulators']) {
    categoryMap['medical simulators'] = categoryMap['medical-simulators'];
  }

  // 1. Create Subcategories
  const subcategoryDocMap: Record<string, any> = {};

  for (const row of rows) {
    const rawCat = (row['Category'] || '').trim();
    const rawSub = (row['Subcategory'] || row['Sub-category'] || '').trim();

    if (!rawCat || !rawSub) continue;

    const catDoc = categoryMap[rawCat.toLowerCase()] || categoryMap[slugify(rawCat, { lower: true, strict: true })];
    if (!catDoc) {
      console.warn(`Warning: Parent category not found for "${rawCat}"`);
      continue;
    }

    const subSlug = slugify(rawSub, { lower: true, strict: true });
    const key = `${catDoc._id.toString()}_${subSlug}`;

    if (!subcategoryDocMap[key]) {
      let subDoc = await Subcategory.findOne({ category: catDoc._id, slug: subSlug });
      if (!subDoc) {
        subDoc = await Subcategory.create({
          name: rawSub,
          slug: subSlug,
          category: catDoc._id,
          description: `${rawSub} under ${catDoc.name}`,
        });
        console.log(`Created Subcategory: "${rawSub}" under Category "${catDoc.name}"`);
      } else {
        console.log(`Existing Subcategory found: "${rawSub}" under Category "${catDoc.name}"`);
      }
      subcategoryDocMap[key] = subDoc;
    }
  }

  console.log('\n=== Subcategories Created / Ensured Successfully! ===\n');

  // 2. Map Products to Subcategories
  console.log('Mapping existing products to subcategories...');
  let updatedCount = 0;
  let skippedCount = 0;

  const allProducts = await Product.find({});

  for (const row of rows) {
    const prodName = (row['Product Name'] || '').trim();
    const rawCat = (row['Category'] || '').trim();
    const rawSub = (row['Subcategory'] || row['Sub-category'] || '').trim();

    if (!prodName || !rawSub) continue;

    const catDoc = categoryMap[rawCat.toLowerCase()] || categoryMap[slugify(rawCat, { lower: true, strict: true })];
    if (!catDoc) continue;

    const subSlug = slugify(rawSub, { lower: true, strict: true });
    const key = `${catDoc._id.toString()}_${subSlug}`;
    const subDoc = subcategoryDocMap[key];

    if (!subDoc) continue;

    // Extract product code prefix e.g. "MV-104"
    const codeMatch = prodName.match(/^(MV-[0-9A-Z]+)/i);
    const codePrefix = codeMatch ? codeMatch[1].toUpperCase() : null;

    // Find matching product in database
    let matchingProduct = allProducts.find((p) => {
      if (p.name.toLowerCase().trim() === prodName.toLowerCase()) return true;
      if (codePrefix && p.name.toUpperCase().includes(codePrefix)) return true;
      return false;
    });

    if (matchingProduct) {
      await Product.findByIdAndUpdate(matchingProduct._id, {
        category: catDoc._id,
        subcategory: subDoc._id,
      });
      updatedCount++;
      console.log(`Updated Product: "${matchingProduct.name}" -> Category: "${catDoc.name}", Subcategory: "${subDoc.name}"`);
    } else {
      skippedCount++;
      console.log(`Product in Excel not in DB: "${prodName}"`);
    }
  }

  console.log('\n========================================');
  console.log(` MIGRATION COMPLETE SUMMARY:`);
  console.log(` - Total Subcategories: ${Object.keys(subcategoryDocMap).length}`);
  console.log(` - Products Updated: ${updatedCount}`);
  console.log(` - Rows Processed: ${rows.length}`);
  console.log('========================================\n');

  await mongoose.disconnect();
}

runSeed().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
