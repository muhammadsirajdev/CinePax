// scripts/createAdmin.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../model/admin.model');

mongoose.connect('mongodb://localhost:27017/Cinepax')
  .then(async () => {
    const exists = await Admin.findOne({ email: 'admin@example.com' });
    if (!exists) {
      const hashed = await bcrypt.hash('admin123', 10);
      await Admin.create({
        fullName: 'Admin',
        email: 'admin@example.com',
        phone: '03001234567',
        password: hashed
      });
      console.log('Admin created successfully');
    } else {
      console.log('Admin already exists');
    }
    process.exit();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit();
  });
