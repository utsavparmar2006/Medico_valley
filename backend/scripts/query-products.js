const mongoose = require('mongoose');

async function checkDb() {
  try {
    await mongoose.connect('mongodb://localhost:27017/delta_healthcare');
    console.log('Connected to DB');
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
      name: String,
      mediaUrls: [String]
    }));
    const products = await Product.find({}).limit(5);
    console.log('Products count:', products.length);
    products.forEach(p => {
      console.log(`Product: "${p.name}"`);
      console.log('mediaUrls:', p.mediaUrls);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDb();
