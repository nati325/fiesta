import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.password; // Never expose password in JSON
  }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
