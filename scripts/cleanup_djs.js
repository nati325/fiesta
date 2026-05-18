import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://netaneldama_db_user:Dama3253!%3F@cluster0.zptzjg6.mongodb.net/fiesta?retryWrites=true&w=majority&appName=Cluster0';

const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }
}, { strict: false }); // strict false just to delete

const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);

async function cleanup() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    const namesToDelete = [/מאיה/, /אמיר/, /רועי/, /אלעד/];
    
    for (const nameRegex of namesToDelete) {
      const deleteResult = await Vendor.deleteMany({ name: { $regex: nameRegex } });
      console.log(`Deleted ${deleteResult.deletedCount} vendors matching ${nameRegex}.`);
    }

    console.log('Cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

cleanup();
