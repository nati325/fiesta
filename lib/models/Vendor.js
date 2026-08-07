import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // Primary category (cards, admin). Extra categories live in `types`.
  type: { type: String, required: true },
  types: { type: [String], default: [] },
  description: { type: String },
  contact: { type: String },
  image: { type: String },
  // Primary region (cards). Extra coverage areas live in `regions`.
  region: { type: String },
  regions: { type: [String], default: [] },
  price: { type: String },
  originalPrice: { type: String },
  discount: { type: String },
  discountType: { type: String, default: 'percent' },
  commissionAmount: { type: Number, default: 0 },
  commissionPercent: { type: Number, default: 0 },
  agreementSigned: { type: Boolean, default: false },
  // First/main contract file — kept for older readers.
  agreementImage: { type: String },
  // Up to 3 contract screenshots / files.
  agreementImages: { type: [String], default: [] },
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
