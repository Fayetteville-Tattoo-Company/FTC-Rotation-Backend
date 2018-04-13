const mongoose = require('mongoose');

const InviteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  key: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Invite', InviteSchema);