const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables from .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const firstEquals = trimmed.indexOf('=');
    if (firstEquals !== -1) {
      const key = trimmed.slice(0, firstEquals).trim();
      const val = trimmed.slice(firstEquals + 1).trim();
      process.env[key] = val;
    }
  });
}

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/delta_healthcare';

// Define schema locally for script independence
const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function runSeed() {
  console.log('Connecting to database:', MONGO_URI);
  
  try {
    await mongoose.connect(MONGO_URI, {
      bufferCommands: false,
    });
    console.log('Database connected.');

    const email = 'admin@deltahealthcare.com';
    const plainPassword = 'DeltaAdminSecret2026!';
    
    // Hash password
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // Check if admin already exists
    console.log('Checking existing Admin...');
    const existing = await Admin.findOne({ email });

    if (existing) {
      console.log('Admin already exists. Updating password and name...');
      existing.name = 'Delta Admin';
      existing.password = hashedPassword;
      await existing.save();
      console.log('Admin updated successfully.');
    } else {
      console.log('Creating new Admin...');
      await Admin.create({
        name: 'Delta Admin',
        email,
        password: hashedPassword,
      });
      console.log('Admin created successfully.');
    }

    mongoose.connection.close();
    console.log('Seeding complete.');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

runSeed();
