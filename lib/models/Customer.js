import mongoose from 'mongoose';
import { buildEventId } from '@/lib/eventId';

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String },
  meetingDate: { type: Date },
  eventDate: { type: Date },
  eventId: { type: String, unique: true, sparse: true },
  leadSource: { type: String },
  budget: { type: String },
  instagram: { type: String },
  closedWithId: { type: String },
  closedWithTitle: { type: String },
  closedDate: { type: String },
  createdAt: { type: Date, default: Date.now }
});

CustomerSchema.pre('save', function (next) {
  if (!this.eventId && this._id) {
    this.eventId = buildEventId(this._id);
  }
  next();
});

CustomerSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id; }
});

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
