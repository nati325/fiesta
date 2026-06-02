import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String },
  contact: { type: String },
  image: { type: String },
  region: { type: String },
  price: { type: String },
  originalPrice: { type: String },
  discount: { type: String },
  discountType: { type: String, default: 'percent' },
  commissionAmount: { type: Number, default: 0 },
  agreementSigned: { type: Boolean, default: false },
  agreementImage: { type: String },
  adminNotes: { type: String },
  googleReviewsLink: { type: String },
  googleRating: { type: Number, default: 5 },
  googleReviewsCount: { type: Number, default: 0 },
  mainProductId: { type: String },
  products: [{
    id: String,
    name: String,
    price: String,
    originalPrice: String,
    image: String
  }],
  videos: [String],
  portfolio: [{
    title: String,
    image: String,
    price: String
  }],
  eventTypes: { type: [String], default: ['חתונה'] },
  reviews: [{
    reviewer: String,
    rating: Number,
    text: String,
    source: String
  }],
  instagramLink: { type: String },
  priceIncludesVat: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

VendorSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret.id || doc._id?.toString();
    delete ret._id;
  }
});

export default mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);
