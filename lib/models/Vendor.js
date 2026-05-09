import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String },
  contact: { type: String },
  image: { type: String },
  region: { type: String },
  price: { type: String },
  discount: { type: String },
  discountType: { type: String, default: 'percent' },
  commissionAmount: { type: Number, default: 0 },
  agreementSigned: { type: Boolean, default: false },
  portfolio: [{
    title: String,
    image: String,
    price: String
  }],
  createdAt: { type: Date, default: Date.now }
});

VendorSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id; }
});

export default mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);
