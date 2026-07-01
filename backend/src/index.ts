import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { connectDB } from './config/db';
import adminRouter from './routes/admin';
import publicRouter from './routes/public';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database and run image url migrations
connectDB().then(async () => {
  try {
    const Product = (await import('./models/Product')).default;
    const oldCpr = '/task trainer/nn7Qd8zjbmuVfyHihPYWPc-yxbFhaQYBGUvedETS6jrXYlYLvEYk03YD3dE02hdIA5iNWzoKDSXM7XFszX5I24AwVQ4YmMXoYRu6OeuF4b5acqFe3j7DWfbQxUbe-pCDGW0mv4gLb99dHyPIZ4Absd6_abCiEMNq2qb9eZwwLuQ.jpg';
    const oldSpinal = '/task trainer/qry-5TDtv7jpi4SZDyiY4Pw-YwWqcjdMEN0lSSJ1Xr2I_VZ-ILzLZYohmywQq8IQbewVKc434yBn0UQkiEDADTb1T3mCcx-9ZGhKHEShlno3_7l3_UGegqErBP2dLgRZLTtNBrn5VLZb4H2_e05LlOf0LvaD1ZCNmMAsIKMPOUI.jpg';

    const res1 = await Product.updateMany(
      { mediaUrls: oldCpr },
      { $set: { "mediaUrls.$": "/task trainer/cpr_torso.jpg" } }
    );
    const res2 = await Product.updateMany(
      { mediaUrls: oldSpinal },
      { $set: { "mediaUrls.$": "/task trainer/spinal_trainer.jpg" } }
    );
    if (res1.modifiedCount > 0 || res2.modifiedCount > 0) {
      console.log(`[Migration] Shortened task trainer image paths in DB. CPR updated: ${res1.modifiedCount}, Spinal updated: ${res2.modifiedCount}`);
    }

  } catch (err) {
    console.error('[Migration] Failed to update task trainer image paths:', err);
  }
});

// Create local uploads folder if it does not exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Serve uploads statically
app.use('/uploads', express.static(uploadsDir));

// Mount Routers
app.use('/api/admin', adminRouter);
app.use('/api/public', publicRouter);

// API Status / Health Check Route
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    message: 'Backend server is running successfully',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/status`);
});

// Trigger reload 1

