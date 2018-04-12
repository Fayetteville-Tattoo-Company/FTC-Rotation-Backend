const mongoose = require('mongoose');

const ArtistSchema = new mongoose.Schema({
  name: {
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
  appointments: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'appointment'
  }]
});

module.exports = mongoose.model('Artist', ArtistSchema);