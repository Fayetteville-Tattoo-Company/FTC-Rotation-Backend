const mongoose = require('mongoose');

const RotationSchema = new mongoose.Schema({
  artist: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true
  }
});

module.exports = mongoose.model('Rotation', RotationSchema);