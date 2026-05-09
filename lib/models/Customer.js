import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String },
  meetingDate: { type: Date },
  closedWithId: { type: String },
  closedWithTitle: { type: String },
  closedDate: { type: String }, // Storing as YYYY-MM-DD string for easier grouping in analytics
  createdAt: { type: Date, default: Date.now }
});

CustomerSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id; }
});

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
