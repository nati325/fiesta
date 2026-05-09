import mongoose from 'mongoose';

const PackageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tagline: { type: String },
  description: { type: String },
  saving: { type: String },
  badge: { type: String },
  badgeColor: { type: String, default: '#D4AF37' },
  image: { type: String },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

PackageSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id; }
});

export default mongoose.models.Package || mongoose.model('Package', PackageSchema);
