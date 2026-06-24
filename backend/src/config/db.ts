import mongoose from 'mongoose';
import DeltaDifferenceCard from '../models/DeltaDifferenceCard';

export const seedDeltaDifferenceCards = async () => {
  try {
    const count = await DeltaDifferenceCard.countDocuments();
    if (count === 0) {
      console.log('Seeding initial Delta Difference cards...');
      await DeltaDifferenceCard.insertMany([
        {
          title: "Anatomical Models",
          category: "Anatomy",
          description: "Dissectible organs, sagittal divisions, and highly-detailed vascular structures for deep scientific learning.",
          initials: "AM",
          displayOrder: 1,
          isActive: true
        },
        {
          title: "Clinical Skills",
          category: "Task Trainers",
          description: "Realistic feedback modules for vascular access, airway management, and suturing techniques.",
          initials: "CS",
          displayOrder: 2,
          isActive: true
        },
        {
          title: "High-Fidelity Manikins",
          category: "Simulators",
          description: "Full-body simulation systems with integrated physiology, life-like responses, and clinical monitoring.",
          initials: "HF",
          displayOrder: 3,
          isActive: true
        },
        {
          title: "Immersive Training",
          category: "Innovation",
          description: "State-of-the-art virtual clinical environments (VR) for training multiple student teams simultaneously.",
          initials: "VR",
          displayOrder: 4,
          isActive: true
        },
        {
          title: "Exclusive Partnerships",
          category: "Global Reach",
          description: "Bringing the world's most trusted, international-standard medical simulation technologies directly to Indian labs.",
          initials: "EP",
          displayOrder: 5,
          isActive: true
        }
      ]);
      console.log('Delta Difference cards seeded successfully.');
    }
  } catch (error) {
    console.error('Failed to seed Delta Difference cards:', error);
  }
};

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
    
    // Seed initial cards if count is 0
    await seedDeltaDifferenceCards();
  } catch (error) {
    console.error('Failed to initialize MongoDB connection:', error);
    process.exit(1);
  }
};
