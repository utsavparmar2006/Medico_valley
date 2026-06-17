const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables
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

// Schema definitions
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  mediaUrls: { type: [String], default: [] },
  catalogUrl: { type: String },
  isActive: { type: Boolean, default: true },
});

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const mockCategories = [
  {
    name: 'Anatomy Models',
    slug: 'anatomy-models',
    description: 'Highest range of Anatomy Models in India. Helping students, professors, and patients in visualizing 3D anatomy with unmatched clinical accuracy.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyMJ39m7nhOmR0SmIl-1umL7BlY9GBDUzss6l-V7ONR1rx_55TLnBW9tQFrWyGA43L_knq10EPrAUa0wPo9KegOikBBSpMJmKBNlgCzB1D-0nBip831lqvpYcaqtSR-E5_N3VAA5MCceUgIOtbXdwpDeunw_vI-ymsnlvOtTq-oX8Aq3LZ3p6bUd4PzXF32GtbCt2qy5paUhTVgV1uN_KaudR_M7Cn-GHfPkZDj_uS17r-U6qgnYtuZIbMJ8YKW_H2_tGUcj1jFujY',
  },
  {
    name: 'Medical Simulators',
    slug: 'medical-simulators',
    description: 'Our simulators offer a risk-free environment, bringing further advancement to clinical skills and promoting quantifiable training standards.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFim8xQP4kYOWzQeQ-30l-sJ4Z9wRAEikZtZEv2H_sm3nezFJaGNJ3zGXFP_f05MkpccqT4IbnD3PFJ0r3gElmiDc7ENuNb1spVydF-JpbCLgAiH5oQendjk3i12I92DFsP76ZCq6ZFwxFkrR9WRFP0WuWlUsPp6KuNe1gek-RXepvkenhoNqW-TqRG0SGps5t-_JseYybfey3w3SWgi5upKrv_Jcw8UIZtLM5H67so5SBwjddjo4eEGHxgyRqWbs5WHsfbBmMiN2x',
  },
  {
    name: 'Task Trainers',
    slug: 'task-trainers',
    description: 'Practice specific procedures on repeat mode, improving hand-eye coordination with the highest range of task trainers in India.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiXax1i8PLP9A_N62prhnWfEZj13Bo33cHHHHSLKr15NLwSuUhWXxbx-orEY_TQEIc5DSK3jCm1UpcNIbH2oozuXwoEq2A_HteM4CoxoUleoTc_KUJ98W065jt-DAduz-TOCcTTJekV5pxV8wHLp-U-RlDmlMrmXDHcTUCPPcAIoLKyx-RwojjRwU2STOJE-sKtAH5F9KnIcgAM6yPxNnuHYAsucA6v_Car4ceYFrD50vOPA7NcsvK1oET7gbTEzMfrrICYqxGdJ0M',
  },
];

async function seedData() {
  console.log('Connecting to database:', MONGO_URI);
  try {
    await mongoose.connect(MONGO_URI, { bufferCommands: false });
    console.log('Database connected.');

    // Clear existing
    console.log('Clearing old categories and products...');
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Seed Categories
    console.log('Seeding categories...');
    const categories = await Category.insertMany(mockCategories);
    console.log(`Seeded ${categories.length} categories.`);

    const anatomyId = categories.find(c => c.slug === 'anatomy-models')._id;
    const simulatorId = categories.find(c => c.slug === 'medical-simulators')._id;
    const trainerId = categories.find(c => c.slug === 'task-trainers')._id;

    // Seed Products
    const mockProducts = [
      {
        name: '3D Human Skull Model',
        slug: '3d-human-skull-model',
        description: 'A medically accurate 3-part human skull reproduction. Includes detachable cranium cap and fully articulated mandible with springs.',
        category: anatomyId,
        mediaUrls: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuA5LEWExhVXFOrOQvIOa86LCs_nx3Nb88TDF6fjs0FKq-T6oieMxX7rJOh2x9Ve552TYFRXeMvtzGtU_ILUOHdXURD4Mx6MywlhFl2BLcqv1jwXiI4QEle6IpV5O9GqXZOktPPdBYJJGFhdd9rXGksVZo8A_TvcfUsEmzcR64yG73MDHjppuK6MK0AIxYYqWemHWsbh4E1EaZTS1UUI6knVoawaA3a_l_0JfZi1n1i3RonEVyllZDGc6SGxI9aKKBd7GB-Ua5Y10_FF',
        ],
        catalogUrl: 'http://localhost:5000/uploads/skull-catalog-sample.pdf',
        isActive: true,
      },
      {
        name: 'Advanced Patient Simulator',
        slug: 'advanced-patient-simulator',
        description: 'Full-body clinical simulator featuring programmable pulse, respiratory contractions, pupil dialation, and responsive simulated patient monitor feed.',
        category: simulatorId,
        mediaUrls: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBD0DK8IKf6mmFHV-5_rb5qr_nGoqIs0k2z-weh_zqK04CXgKBabviKSO8STJiNlZ0RsdOqewK-WEHokVEH1QpxhPcMafYgEW9iLijDLGah5VwtYGPlDWnxHvtnh6kLItrkzMdqwMHs4oyDGwLG8a41GWsq5UXvj3BWhsw1BpRix6zsxOjM_x-5FJGgE-uKtwApBil-MzHq2Gnj-b_PGh9BXqsv764SJrxlGBH5HvEfsj0UMntARIwWLyZru5GHdWYNdKnutGSfvQ1C',
        ],
        catalogUrl: 'http://localhost:5000/uploads/simulator-catalog-sample.pdf',
        isActive: true,
      },
      {
        name: 'Advanced CPR Training Manikin',
        slug: 'advanced-cpr-training-manikin',
        description: 'A realistic task trainer designed for learning cardiopulmonary resuscitation. Features electronic feedback for chest compression depth, rate, and lung ventilation volume.',
        category: trainerId,
        mediaUrls: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAoRCwbgur7qu6qRY381FbsjzjKjZzBhIV1dFP90EINyq2NSkXTAYVngehS6q7FrwemH22DeK94dpdjTTZN75XjgDSgW1KJd5z3f3ycEt-_1QWFNpWLijcUz3R6xXVB_o2lNGcNVvcUHKaJaTlMiuEc8CsWL0D-dUWc8Q4EzeRISuCKDPTLEtHgVTX84jL5mbbgUUY7NmLaJkCtG1sJOk_nrnXun90F9K8rcyfvPJgDEaNENhnGRHwiMotfa2qyfeXyhppPJ7VyIECo',
        ],
        catalogUrl: 'http://localhost:5000/uploads/cpr-trainer-catalog-sample.pdf',
        isActive: true,
      },
    ];

    console.log('Seeding products...');
    const products = await Product.insertMany(mockProducts);
    console.log(`Seeded ${products.length} products.`);

    mongoose.connection.close();
    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedData();
