import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Import Mongoose Models
import Admin from '../models/Admin';
import Blog from '../models/Blog';
import Category from '../models/Category';
import Client from '../models/Client';
import DeltaDifferenceCard from '../models/DeltaDifferenceCard';
import Inquiry from '../models/Inquiry';
import Product from '../models/Product';
import Rating from '../models/Rating';
import Sector from '../models/Sector';

const LOCAL_DB_URI_PRIMARY = 'mongodb://localhost:27017/delta_healthcare';
const LOCAL_DB_URI_SECONDARY = 'mongodb://localhost:27017/medico_valley';
const ATLAS_DB_URI = 'mongodb+srv://milan_db_user:SimulationSolutions%40619@cluster0.pfknpr2.mongodb.net/medico_valley?retryWrites=true&w=majority&appName=Cluster0';

const BACKUP_DIR = path.join(__dirname, '../../backup');

const modelsList = [
  { name: 'Admin', model: Admin },
  { name: 'Blog', model: Blog },
  { name: 'Category', model: Category },
  { name: 'Client', model: Client },
  { name: 'DeltaDifferenceCard', model: DeltaDifferenceCard },
  { name: 'Inquiry', model: Inquiry },
  { name: 'Product', model: Product },
  { name: 'Rating', model: Rating },
  { name: 'Sector', model: Sector }
];

async function backupLocal() {
  console.log('========================================');
  console.log('PHASE 1: BACKING UP LOCAL MONGO DATABASE');
  console.log('========================================');

  // Create backup directory if it does not exist
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`Created backup directory at: ${BACKUP_DIR}`);
  }

  // Try primary local database name first
  let connected = false;
  try {
    console.log(`Connecting to primary local DB: ${LOCAL_DB_URI_PRIMARY}`);
    await mongoose.connect(LOCAL_DB_URI_PRIMARY);
    connected = true;
  } catch (err) {
    console.warn(`Could not connect to ${LOCAL_DB_URI_PRIMARY}. Trying secondary DB...`);
    try {
      await mongoose.connect(LOCAL_DB_URI_SECONDARY);
      connected = true;
    } catch (secondaryErr) {
      console.error('Failed to connect to local MongoDB. Make sure it is running locally.');
      throw secondaryErr;
    }
  }

  if (!connected) return;

  for (const item of modelsList) {
    try {
      console.log(`Backing up collection: ${item.name}...`);
      const documents = await (item.model as any).find({}).lean();
      
      const filePath = path.join(BACKUP_DIR, `${item.name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(documents, null, 2), 'utf-8');
      
      console.log(`✓ Backed up ${documents.length} documents to ${item.name}.json`);
    } catch (err) {
      console.error(`✗ Error backing up ${item.name}:`, err);
      throw err;
    }
  }

  await mongoose.disconnect();
  console.log('\nPHASE 1 COMPLETE: Local backup files created successfully.\n');
}

async function restoreToAtlas() {
  console.log('========================================');
  console.log('PHASE 2: MIGRATING DATA TO MONGO ATLAS  ');
  console.log('========================================');

  console.log(`Connecting to MongoDB Atlas Cluster: ${ATLAS_DB_URI}`);
  await mongoose.connect(ATLAS_DB_URI);

  for (const item of modelsList) {
    try {
      const filePath = path.join(BACKUP_DIR, `${item.name}.json`);
      if (!fs.existsSync(filePath)) {
        console.warn(`Backup file not found for ${item.name}, skipping.`);
        continue;
      }

      const rawData = fs.readFileSync(filePath, 'utf-8');
      const documents = JSON.parse(rawData);

      console.log(`Clearing existing documents in Atlas for ${item.name}...`);
      await (item.model as any).deleteMany({});

      if (documents.length > 0) {
        console.log(`Inserting ${documents.length} documents into Atlas for ${item.name}...`);
        await (item.model as any).insertMany(documents);
        console.log(`✓ Successfully migrated ${documents.length} items.`);
      } else {
        console.log(`- Collection ${item.name} has 0 items. Cleared cluster collection.`);
      }
    } catch (err) {
      console.error(`✗ Error restoring ${item.name} to Atlas:`, err);
      throw err;
    }
  }

  await mongoose.disconnect();
  console.log('\nPHASE 2 COMPLETE: Data migration finished successfully.');
  console.log('========================================\n');
}

async function run() {
  try {
    await backupLocal();
    await restoreToAtlas();
    console.log('🎉 Migration Completed Successfully! 🎉');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

run();
