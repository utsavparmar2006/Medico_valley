import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import Client from '../models/Client';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/delta_healthcare';
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

async function uploadFileToS3(filename: string, localPath: string): Promise<string> {
  if (!fs.existsSync(localPath)) return '';

  const fileBuffer = fs.readFileSync(localPath);
  const s3Key = `uploads/${filename}`;

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: 'image/png',
      })
    );
    console.log(`Uploaded to S3: ${S3_BASE_URL}${filename}`);
    return `${S3_BASE_URL}${filename}`;
  } catch (err: any) {
    console.error(`S3 upload error for ${filename}:`, err.message);
    return `/uploads/${filename}`;
  }
}

async function updateClients() {
  try {
    console.log('Connecting to MongoDB database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB Atlas.');

    // Upload generated logos to S3
    const logo1Path = path.join(__dirname, '../../../frontend/public/uploads/client_logo_1.png');
    const logo2Path = path.join(__dirname, '../../../frontend/public/uploads/client_logo_2.png');
    const logo3Path = path.join(__dirname, '../../../frontend/public/uploads/client_logo_3.png');

    const s3Url1 = await uploadFileToS3('client_logo_1.png', logo1Path);
    const s3Url2 = await uploadFileToS3('client_logo_2.png', logo2Path);
    const s3Url3 = await uploadFileToS3('client_logo_3.png', logo3Path);

    // Clear old test client records
    await Client.deleteMany({});

    const initialClients = [
      {
        name: 'Apollo Healthcare & Hospitals Group',
        location: 'Chennai, Tamil Nadu',
        testimonial: 'Empowering our clinical students and medical staff with standard clinical simulators. The educational impact is highly quantifiable.',
        type: 'Leading Healthcare Network',
        logoUrl: s3Url1 || '/uploads/client_logo_1.png',
        displayOrder: 1,
      },
      {
        name: 'All India Institute of Medical Sciences (AIIMS)',
        location: 'New Delhi',
        testimonial: 'Top-tier simulators and excellent service. Medico Valley is our trusted partner in setting up state-of-the-art simulation labs.',
        type: 'Apex Public Medical Institute',
        logoUrl: s3Url2 || '/uploads/client_logo_2.png',
        displayOrder: 2,
      },
      {
        name: 'Manipal Academy of Higher Medical Education',
        location: 'Manipal, Karnataka',
        testimonial: 'Their customer support and high-fidelity anatomical models are second to none. Our students have gained incredible clinical confidence.',
        type: 'Medical Academy & University',
        logoUrl: s3Url3 || '/uploads/client_logo_3.png',
        displayOrder: 3,
      },
    ];

    await Client.insertMany(initialClients);
    console.log('Successfully updated Top Clients with S3 logo URLs in MongoDB Atlas!');
  } catch (err) {
    console.error('Error updating clients:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

updateClients();
