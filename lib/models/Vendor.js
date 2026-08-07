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
  commissionPercent: { type: Number, default: 0 },
  agreementSigned: { type: Boolean, default: false },
  agreementImage: { type: String },
  adminNotes: { type: String },
  googleReviewsLink: { type: String },
  googleRating: { type: Number, default: 0 },
  googleReviewsCount: { type: Number, default: 0 },
  mainProductId: { type: String },
  products: [{
    id: String,
    name: String,
    description: String,
    price: String,
    originalPrice: String,
    image: String,
    // 'main' products are alternatives the customer picks between and set the
    // vendor's headline price. 'addon' products are extras on top of one.
    kind: { type: String, default: 'main' },
    commissionAmount: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
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
