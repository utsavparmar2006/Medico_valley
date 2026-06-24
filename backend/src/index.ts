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

// Connect to Database
connectDB();

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

