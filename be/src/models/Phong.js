import mongoose from 'mongoose';

const phongSchema = new mongoose.Schema(
  { ten: { type: String, required: true, unique: true, trim: true } },
  { timestamps: true }
);

export default mongoose.model('Phong', phongSchema);
