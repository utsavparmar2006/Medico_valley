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

const DeltaDifferenceCardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  initials: { type: String, required: true },
  iconImage: { type: String },
  displayOrder: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

const DeltaDifferenceCard = mongoose.models.DeltaDifferenceCard || mongoose.model('DeltaDifferenceCard', DeltaDifferenceCardSchema);

const mockCategories = [
  {
    name: 'Anatomy Models',
    slug: 'anatomy-models',
    description: 'Highest range of Anatomy Models in India. Helping students, professors, and patients in visualizing 3D anatomy with unmatched clinical accuracy.',
    imageUrl: '/anatommy model/heart_model.png',
  },
  {
    name: 'Medical Simulators',
    slug: 'medical-simulators',
    description: 'Our simulators offer a risk-free environment, bringing further advancement to clinical skills and promoting quantifiable training standards.',
    imageUrl: '/products/medical simulators/patient_simulator.png',
  },
  {
    name: 'Task Trainers',
    slug: 'task-trainers',
    description: 'Practice specific procedures on repeat mode, improving hand-eye coordination with the highest range of task trainers in India.',
    imageUrl: '/task trainer/airway_trainer_clean.png',
  },
];

async function seedData() {
  console.log('Connecting to database:', MONGO_URI);
  try {
    await mongoose.connect(MONGO_URI, { bufferCommands: false });
    console.log('Database connected.');

    // Clear existing
    console.log('Clearing old categories, products, and delta difference cards...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    await DeltaDifferenceCard.deleteMany({});

    // Seed Categories
    console.log('Seeding categories...');
    const categories = await Category.insertMany(mockCategories);
    console.log(`Seeded ${categories.length} categories.`);

    const anatomyId = categories.find(c => c.slug === 'anatomy-models')._id;
    const simulatorId = categories.find(c => c.slug === 'medical-simulators')._id;
    const trainerId = categories.find(c => c.slug === 'task-trainers')._id;

    // Seed Products
    const mockProducts = [
      // Anatomy Models
      {
        name: 'Life-Size Human Heart Model (5-part)',
        slug: 'life-size-human-heart-model',
        description: 'Highly detailed 5-part human heart model. Features detachable anterior wall, chambers, valves, and major blood vessels for cardiac education.',
        category: anatomyId,
        mediaUrls: [
          '/anatommy model/heart_model.png',
        ],
        catalogUrl: 'http://localhost:5000/uploads/heart-catalog.pdf',
        isActive: true,
      },
      {
        name: 'Classic Human Skeleton Model (Stan)',
        slug: 'classic-human-skeleton-model',
        description: 'Standard full-size medical skeleton model. Hand-assembled with heavy-duty metal stand and details showing skeletal structure, joints, and articulation.',
        category: anatomyId,
        mediaUrls: [
          '/anatommy model/skeleton_model.png',
        ],
        catalogUrl: 'http://localhost:5000/uploads/skeleton-catalog.pdf',
        isActive: true,
      },
      {
        name: 'Deluxe Dual-Sex Muscle Figure (31-part)',
        slug: 'deluxe-dual-sex-muscle-figure',
        description: 'Life-size muscle figure model featuring removable organs, dual sex inserts, and detailed muscle groups for deep anatomical exploration.',
        category: anatomyId,
        mediaUrls: [
          '/anatommy model/muscle_figure.png',
        ],
        catalogUrl: 'http://localhost:5000/uploads/muscle-figure-catalog.pdf',
        isActive: true,
      },
      {
        name: 'Didactic Human Skull Model (22-part)',
        slug: 'didactic-human-skull-model',
        description: '22-part color-coded didactic human skull. Easily detachable bones for thorough study of individual cranial structures.',
        category: anatomyId,
        mediaUrls: [
          '/anatommy model/28e10cba-0346-4f22-b2ea-3f9da10fe067.jpg',
        ],
        catalogUrl: 'http://localhost:5000/uploads/skull-catalog.pdf',
        isActive: true,
      },
      {
        name: 'Dissectible Human Torso Model (16-part)',
        slug: 'dissectible-human-torso-model',
        description: 'Dual-sex dissectible human torso. Features detachable head, brain segments, lungs, heart, stomach, liver, and intestinal tract.',
        category: anatomyId,
        mediaUrls: [
          '/anatommy model/57e99808-6c8a-4495-ae7e-1489824377c4.jpg',
        ],
        catalogUrl: 'http://localhost:5000/uploads/torso-catalog.pdf',
        isActive: true,
      },
      {
        name: 'Advanced Dental Hygiene Model',
        slug: 'advanced-dental-hygiene-model',
        description: 'Enlarged dental jaw model with flexible joints, realistic teeth structure, and removable gums for teaching proper oral hygiene techniques.',
        category: anatomyId,
        mediaUrls: [
          '/anatommy model/defcecb8-2272-4af0-bd0c-c80f5bc899eb.png',
        ],
        catalogUrl: 'http://localhost:5000/uploads/dental-catalog.pdf',
        isActive: true,
      },

      // Medical Simulators
      {
        name: 'High-Fidelity Adult Patient Simulator',
        slug: 'high-fidelity-adult-patient-simulator',
        description: 'Wireless full-body simulator with advanced neurological, cardiovascular, and respiratory responses. Displays responsive vitals to interventions.',
        category: simulatorId,
        mediaUrls: [
          '/products/medical simulators/patient_simulator.png',
        ],
        catalogUrl: 'http://localhost:5000/uploads/patient-sim-catalog.pdf',
        isActive: true,
      },
      {
        name: 'Interactive Infant Emergency Simulator',
        slug: 'interactive-infant-emergency-simulator',
        description: 'Realistic newborn simulator for emergency ventilation, intubation, and CPR training. Features feedback sensors for compression depth.',
        category: simulatorId,
        mediaUrls: [
          '/products/medical simulators/infant_simulator.png',
        ],
        catalogUrl: 'http://localhost:5000/uploads/infant-sim-catalog.pdf',
        isActive: true,
      },
      {
        name: 'Advanced Pediatric Simulator',
        slug: 'advanced-pediatric-simulator',
        description: 'Lifecast 5-year-old child simulator. Features realistic airway management, vascular access, and cardiac monitoring for pediatric emergencies.',
        category: simulatorId,
        mediaUrls: [
          '/products/medical simulators/pediatric_simulator.png',
        ],
        catalogUrl: 'http://localhost:5000/uploads/pediatric-sim-catalog.pdf',
        isActive: true,
      },
      {
        name: 'Clinical Nursing Care Simulator',
        slug: 'clinical-nursing-care-simulator',
        description: 'Versatile simulator for basic to advanced patient care procedures, including catheterization, injection, and patient mobilization.',
        category: simulatorId,
        mediaUrls: [
          '/products/medical simulators/7c8292a1-cd45-4cf3-a455-5546e32ba554.jpg',
        ],
        catalogUrl: 'http://localhost:5000/uploads/nursing-sim-catalog.pdf',
        isActive: true,
      },
      {
        name: 'Birthing & Maternal Care Simulator',
        slug: 'birthing-and-maternal-care-simulator',
        description: 'Full-scale maternal delivery simulator. Recreates dynamic birthing stages, postpartum hemorrhage, and neonatal resuscitation scenarios.',
        category: simulatorId,
        mediaUrls: [
          '/products/medical simulators/9700d3b2-bb00-4e02-87a2-aa9d949d344d.jpg',
        ],
        catalogUrl: 'http://localhost:5000/uploads/maternal-sim-catalog.pdf',
        isActive: true,
      },
      {
        name: 'Cardiac Auscultation Simulator (Cardionics)',
        slug: 'cardiac-auscultation-simulator',
        description: 'Auscultation trainer featuring 30+ programmed heart, lung, and bowel sounds. Guided learning path for stethoscope diagnostics.',
        category: simulatorId,
        mediaUrls: [
          '/products/medical simulators/f8f220ec-abae-4552-adb5-0012d00e80bf.jpg',
        ],
        catalogUrl: 'http://localhost:5000/uploads/auscultation-sim-catalog.pdf',
        isActive: true,
      },

      // Task Trainers
      {
        name: 'Airway Management Trainer (Adult)',
        slug: 'airway-management-trainer',
        description: 'Anatomically correct head and airway model. For teaching endotracheal intubation, bag-valve-mask ventilation, and suctioning.',
        category: trainerId,
        mediaUrls: [
          '/task trainer/airway_trainer_clean.png',
        ],
        catalogUrl: 'http://localhost:5000/uploads/airway-trainer-catalog.pdf',
        isActive: true,
      },
      {
        name: 'Vascular Access & IV Injection Arm',
        slug: 'vascular-access-iv-injection-arm',
        description: 'Realistic venous system training arm. Mimics flashback, tissue resistance, and supports venipuncture, IV infusion, and injections.',
        category: trainerId,
        mediaUrls: [
          '/task trainer/iv_arm.png',
        ],
        catalogUrl: 'http://localhost:5000/uploads/iv-arm-catalog.pdf',
        isActive: true,
      },
      {
        name: 'Advanced Suture Training Board',
        slug: 'advanced-suture-training-board',
        description: 'Multi-layered silicone suture pad. Features realistic skin epidermis, dermis, fat, and muscle layers for practicing standard cut sutures.',
        category: trainerId,
        mediaUrls: [
          '/task trainer/suture_board.png',
        ],
        catalogUrl: 'http://localhost:5000/uploads/suture-board-catalog.pdf',
        isActive: true,
      },
      {
        name: 'CPR & Defibrillation Training Torso',
        slug: 'cpr-defibrillation-training-torso',
        description: 'Lightweight training torso for CPR. Features audio-visual feedback indicators for compression rate and depth, compatible with AED trainers.',
        category: trainerId,
        mediaUrls: [
          '/task trainer/cpr_torso.jpg',
        ],
        catalogUrl: 'http://localhost:5000/uploads/cpr-torso-catalog.pdf',
        isActive: true,
      },
      {
        name: 'Epidural & Spinal Injection Trainer',
        slug: 'epidural-spinal-injection-trainer',
        description: 'Anatomical lumbar model featuring needle resistance, loss-of-pressure feeling, and CSF feedback for lumbar punctures.',
        category: trainerId,
        mediaUrls: [
          '/task trainer/spinal_trainer.jpg',
        ],
        catalogUrl: 'http://localhost:5000/uploads/lumbar-trainer-catalog.pdf',
        isActive: true,
      },
    ];

    console.log('Seeding products...');
    const products = await Product.insertMany(mockProducts);
    console.log(`Seeded ${products.length} products.`);

    console.log('Seeding Delta Difference cards...');
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
    console.log('Seeded Delta Difference cards.');

    mongoose.connection.close();
    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedData();
