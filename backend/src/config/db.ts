import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/delta_healthcare';
    
    // Set up mongoose connection options if needed (modern mongoose version 6+ defaults are fine)
    mongoose.connection.on('connected', () => {
      console.log('Successfully connected to MongoDB Database');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB connection disconnected');
    });

    await mongoose.connect(mongoURI);
  } catch (error) {
    console.error('Failed to initialize MongoDB connection:', error);
    process.exit(1);
  }
};
