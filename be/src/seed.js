import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

await mongoose.connect(process.env.MONGO_URI);

const existing = await User.findOne({ email: 'admin@essc.vn' });
if (existing) {
  console.log('Admin đã tồn tại:', existing.email);
} else {
  await User.create({
    name: 'Super Admin',
    email: 'admin@essc.vn',
    password: 'Admin@123',
    role: 'admin',
  });
  console.log('✓ Tạo admin thành công!');
  console.log('  Email   : admin@essc.vn');
  console.log('  Password: Admin@123');
}

await mongoose.disconnect();
process.exit(0);
