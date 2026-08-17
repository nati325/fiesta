import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 32,
  },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  isAdmin: { type: Boolean, default: false },
  favorites: { type: [String], default: [] },
  eventJourney: {
    eventType: { type: String, default: '' },
    date: { type: String, default: '' },
    region: { type: String, default: '' },
    guests: { type: String, default: '' },
    budget: { type: String, default: '' },
    completedCategories: { type: [String], default: [] },
    cart: { type: [String], default: [] },
    onboardingComplete: { type: Boolean, default: false },
    lastCategory: { type: String, default: '' },
    lastVisitedAt: { type: Date, default: null },
  },
  phone: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.password;
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
