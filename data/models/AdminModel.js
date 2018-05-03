const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  name : {
    type: String,
    required: true,
    lowercase: true
  },
  username: {
    type: String,
    required: true, 
    unique: true,
    lowercase: true
  },
  hash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Admin', AdminSchema);