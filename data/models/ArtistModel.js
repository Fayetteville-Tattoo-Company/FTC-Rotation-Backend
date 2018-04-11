import mongoose from 'mongoose';

const ArtistSchema = new mongoose.Schema({
  name: {
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
  },
  appointments: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'appointment'
  }]
});

module.exports = mongoose.model('Artist', ArtistSchema);