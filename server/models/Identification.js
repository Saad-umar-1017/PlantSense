const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  commonName: { type: String, required: true },
  scientificName: { type: String, default: '' },
  confidence: { type: Number, default: 0 },
  description: { type: String, default: '' },
  habitat: { type: String, default: '' },
  growthCharacteristics: { type: String, default: '' },
  generalCare: {
    watering: { type: String, default: '' },
    sunlight: { type: String, default: '' },
    soil: { type: String, default: '' },
    temperature: { type: String, default: '' }
  }
}, { _id: false });

const identificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  predictions: [predictionSchema],
  selectedPrediction: {
    type: Number,
    default: null // Index of the prediction user confirmed
  },
  addedToLibrary: {
    type: Boolean,
    default: false
  },
  plantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Identification', identificationSchema);
