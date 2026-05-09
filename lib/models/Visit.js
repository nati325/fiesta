import mongoose from 'mongoose';

const VisitSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  date: { type: String }, // YYYY-MM-DD
  page: { type: String, default: '/' }
});

VisitSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id; }
});

export default mongoose.models.Visit || mongoose.model('Visit', VisitSchema);
