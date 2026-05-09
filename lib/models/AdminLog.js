import mongoose from 'mongoose';

const AdminLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: String },
  details: { type: mongoose.Schema.Types.Mixed }
});

const LogModel = mongoose.models.AdminLog || mongoose.model('AdminLog', AdminLogSchema);

class AdminLog {
  static async log(action, entity, entityId, details = {}) {
    try {
      await LogModel.create({ action, entity, entityId, details });
    } catch (e) {
      console.error('Logging failed:', e);
    }
  }
  
  static async getAll() {
    return await LogModel.find().sort({ timestamp: -1 });
  }
}

export default AdminLog;
