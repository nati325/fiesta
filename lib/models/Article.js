import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  excerpt: { type: String },
  image: { type: String },
  link: { type: String },
  author: { type: String, default: 'צוות Fiesta' },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  createdAt: { type: Date, default: Date.now }
});

ArticleSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id; }
});

export default mongoose.models.Article || mongoose.model('Article', ArticleSchema);
