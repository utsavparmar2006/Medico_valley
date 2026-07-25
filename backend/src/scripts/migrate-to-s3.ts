import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import Category from '../models/Category';
import Product from '../models/Product';
import Blog from '../models/Blog';
import Client from '../models/Client';
import Sector from '../models/Sector';

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI;
const BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'medico-valley-media-production';
const REGION = process.env.AWS_REGION || 'ap-south-1';

const S3_BASE_URL = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/uploads/`;

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  region: REGION,
});

async function uploadLocalFilesToS3() {
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log("⚠️ No local uploads folder found.");
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  console.log(`\n📤 Found ${files.length} local files in uploads folder. Uploading to S3 bucket [${BUCKET_NAME}]...`);

  let uploadedCount = 0;
  for (const filename of files) {
    const filePath = path.join(uploadsDir, filename);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      const fileBuffer = fs.readFileSync(filePath);
      const s3Key = `uploads/${filename}`;

      try {
        await s3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: fileBuffer,
          })
        );
        uploadedCount++;
        console.log(`   ☁️ Uploaded: ${s3Key}`);
      } catch (err: any) {
        console.error(`   ❌ Failed to upload ${filename}:`, err.message);
      }
    }
  }
  console.log(`✅ Uploaded ${uploadedCount}/${files.length} files to S3 bucket.\n`);
}

function updateUrl(url: string | undefined): { updated: boolean; newUrl: string } {
  if (!url) return { updated: false, newUrl: '' };

  const localPrefixes = [
    'http://localhost:5000/uploads/',
    'http://127.0.0.1:5000/uploads/',
    '/uploads/',
  ];

  for (const prefix of localPrefixes) {
    if (url.startsWith(prefix)) {
      const filename = url.substring(prefix.length);
      return { updated: true, newUrl: `${S3_BASE_URL}${filename}` };
    }
  }

  return { updated: false, newUrl: url };
}

async function runMigration() {
  if (!MONGO_URI) {
    console.error("❌ Error: MONGO_URI is not defined in your backend/.env file.");
    process.exit(1);
  }

  console.log(`Connecting to database: ${MONGO_URI.split('@')[1] || MONGO_URI}`);
  console.log(`S3 Base URL: ${S3_BASE_URL}`);

  try {
    // Step 1: Upload existing files to S3
    await uploadLocalFilesToS3();

    // Step 2: Connect DB and update documents
    await mongoose.connect(MONGO_URI);
    console.log("🔌 Database connected successfully.\n");

    let totalMigrated = 0;

    // 1. Migrate Categories
    const categories = await Category.find({});
    console.log(`📁 Checking ${categories.length} Categories...`);
    for (const cat of categories) {
      const result = updateUrl(cat.imageUrl);
      if (result.updated) {
        cat.imageUrl = result.newUrl;
        await cat.save();
        console.log(`   ✅ Migrated Category [${cat.name}] -> ${cat.imageUrl}`);
        totalMigrated++;
      }
    }

    // 2. Migrate Products
    const products = await Product.find({});
    console.log(`\n📦 Checking ${products.length} Products...`);
    for (const prod of products) {
      let updated = false;

      if (prod.mediaUrls && prod.mediaUrls.length > 0) {
        prod.mediaUrls = prod.mediaUrls.map(url => {
          const res = updateUrl(url);
          if (res.updated) {
            updated = true;
            totalMigrated++;
            return res.newUrl;
          }
          return url;
        });
      }

      if (prod.catalogUrl) {
        const res = updateUrl(prod.catalogUrl);
        if (res.updated) {
          prod.catalogUrl = res.newUrl;
          updated = true;
          totalMigrated++;
        }
      }

      if (updated) {
        await prod.save();
        console.log(`   ✅ Migrated Product [${prod.name}]`);
      }
    }

    // 3. Migrate Blogs
    const blogs = await Blog.find({});
    console.log(`\n✍️ Checking ${blogs.length} Blogs...`);
    for (const blog of blogs) {
      const res = updateUrl(blog.imageUrl);
      if (res.updated) {
        blog.imageUrl = res.newUrl;
        await blog.save();
        console.log(`   ✅ Migrated Blog [${blog.title}] -> ${blog.imageUrl}`);
        totalMigrated++;
      }
    }

    // 4. Migrate Clients / Testimonials
    const clients = await Client.find({});
    console.log(`\n👥 Checking ${clients.length} Clients...`);
    for (const client of clients) {
      const res = updateUrl(client.logoUrl);
      if (res.updated) {
        client.logoUrl = res.newUrl;
        await client.save();
        console.log(`   ✅ Migrated Client [${client.name}] -> ${client.logoUrl}`);
        totalMigrated++;
      }
    }

    // 5. Migrate Sectors / Labs
    const sectors = await Sector.find({});
    console.log(`\n🔬 Checking ${sectors.length} Sectors...`);
    for (const sec of sectors) {
      let updated = false;
      const resDefault = updateUrl(sec.defaultImg);
      if (resDefault.updated) {
        sec.defaultImg = resDefault.newUrl;
        updated = true;
        totalMigrated++;
      }
      const resHover = updateUrl(sec.hoverImg);
      if (resHover.updated) {
        sec.hoverImg = resHover.newUrl;
        updated = true;
        totalMigrated++;
      }
      if (updated) {
        await sec.save();
        console.log(`   ✅ Migrated Sector [${sec.title}]`);
      }
    }

    console.log(`\n🎉 Migration completed successfully! Total database URLs updated: ${totalMigrated}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed with error:", error);
    process.exit(1);
  }
}

runMigration();

