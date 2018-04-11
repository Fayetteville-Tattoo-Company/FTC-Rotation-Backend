const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  name : {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true, 
    unique: true
  },
  hash: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Admin', AdminSchema);