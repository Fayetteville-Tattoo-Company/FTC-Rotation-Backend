const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  value: {
    type: mongoose.SchemaTypes.Mixed,
    required: true
  }
});

module.exports = mongoose.model("Settings", SettingsSchema);