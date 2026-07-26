import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

dotenv.config({ path: path.join(__dirname, '../../.env') });

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

async function uploadSimImage() {
  const localPath = path.join(__dirname, '../../../frontend/public/uploads/simulation_hero.png');
  if (!fs.existsSync(localPath)) {
    console.error('File not found:', localPath);
    return;
  }

  const fileBuffer = fs.readFileSync(localPath);
  const s3Key = 'uploads/simulation_hero.png';

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: 'image/png',
      })
    );
    console.log(`Uploaded Simulation Centre image to S3: ${S3_BASE_URL}simulation_hero.png`);
  } catch (err: any) {
    console.error('S3 upload error:', err.message);
  }
}

uploadSimImage();
