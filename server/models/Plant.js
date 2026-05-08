const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nickname: {
    type: String,
    default: ''
  },
  species: {
    commonName: { type: String, default: '' },
    scientificName: { type: String, default: '' },
    description: { type: String, default: '' },
    confidence: { type: Number, default: 0 }
  },
  environment: {
    location: { type: String, enum: ['indoor', 'outdoor', ''], default: '' },
    potType: { type: String, default: '' },
    climateZone: { type: String, default: '' },
    season: { type: String, default: '' }
  },
  imageUrl: {
    type: String,
    default: ''
  },
  generalCare: {
    watering: { type: String, default: '' },
    sunlight: { type: String, default: '' },
    soil: { type: String, default: '' },
    temperature: { type: String, default: '' }
  },
  identificationHistory: [{
    imageUrl: String,
    predictions: [{
      commonName: String,
      scientificName: String,
      confidence: Number,
      description: String
    }],
    createdAt: { type: Date, default: Date.now }
  }],
  diagnosisReports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Diagnosis'
  }]
}, {
  timestamps: true
});

// Max 50 plants per user
plantSchema.statics.countUserPlants = async function(userId) {
  return await this.countDocuments({ user: userId });
};

module.exports = mongoose.model('Plant', plantSchema);
