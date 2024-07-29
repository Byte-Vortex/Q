const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const adminUri = 'mongodb+srv://akshatanwar24:Akshat24Saini10@cluster0.faninty.mongodb.net/authDB?retryWrites=true&w=majority&appName=Cluster0';
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

const Admin = mongoose.model('Admin', adminSchema);

mongoose.connect(adminUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log('MongoDB connection error:', err));

async function createAdmin(username, plaintextPassword) {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plaintextPassword, saltRounds);

    const newAdmin = new Admin({
      username: username,
      password: hashedPassword
    });

    await newAdmin.save();
    console.log(`Admin ${username} created successfully`);
    mongoose.disconnect();
  } catch (err) {
    console.error(`Error creating admin ${username}:, err.message`);
    mongoose.disconnect();
  }
}

// Replace 'admin' and 'adminpassword' with your desired admin username and password
createAdmin('admin', '1234');