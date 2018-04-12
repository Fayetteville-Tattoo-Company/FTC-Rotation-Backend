const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  client : {
    type: String,
    required: true,
    lowercase: true
  },
  rotationID: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Rotation',
    required: true
  },
  date: {
    type: Date 
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);