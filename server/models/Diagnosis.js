const mongoose = require('mongoose');

const conditionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  severity: { type: String, enum: ['Mild', 'Moderate', 'Severe'], default: 'Mild' },
  confidence: { type: Number, default: 0 },
  description: { type: String, default: '' },
  remedy: { type: String, default: '' }
}, { _id: false });

const diagnosisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
    required: false
  },
  imageUrl: {
    type: String,
    required: true
  },
  overallHealth: {
    type: String,
    enum: ['Healthy', 'Mild Issues', 'Moderate Issues', 'Severe Issues'],
    default: 'Healthy'
  },
  conditions: [conditionSchema],
  summary: {
    type: String,
    default: ''
  },
  isSaved: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Diagnosis', diagnosisSchema);
