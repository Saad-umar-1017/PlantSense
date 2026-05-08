const Plant = require('../models/Plant');
const Identification = require('../models/Identification');
const { identifyPlant } = require('../utils/groqService');
const fs = require('fs');
const path = require('path');

// POST /api/plants/identify — Upload image and identify species
const identify = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a plant image' });
    }

    const imagePath = req.file.path;
    const imageUrl = `/uploads/${req.file.filename}`;

    // Call Groq API for identification
    const predictions = await identifyPlant(imagePath);

    // Save identification record
    const identification = await Identification.create({
      user: req.user._id,
      imageUrl,
      predictions
    });

    res.json({
      message: 'Plant identified successfully',
      identification: {
        id: identification._id,
        imageUrl,
        predictions,
        createdAt: identification.createdAt
      }
    });
  } catch (error) {
    console.error('Identify Error:', error);
    res.status(500).json({ message: error.message || 'Failed to identify plant' });
  }
};

// POST /api/plants/reidentify/:id — Re-identify with new image
const reidentify = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a new plant image' });
    }

    const imagePath = req.file.path;
    const imageUrl = `/uploads/${req.file.filename}`;

    const predictions = await identifyPlant(imagePath);

    // Create new identification record
    const identification = await Identification.create({
      user: req.user._id,
      imageUrl,
      predictions
    });

    res.json({
      message: 'Plant re-identified successfully',
      identification: {
        id: identification._id,
        imageUrl,
        predictions,
        createdAt: identification.createdAt
      }
    });
  } catch (error) {
    console.error('Reidentify Error:', error);
    res.status(500).json({ message: error.message || 'Failed to re-identify plant' });
  }
};

// GET /api/plants/library — Get user's plant library
const getLibrary = async (req, res) => {
  try {
    const plants = await Plant.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('-identificationHistory');

    res.json({ plants, count: plants.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch plant library' });
  }
};

// POST /api/plants/library — Add plant to library
const addToLibrary = async (req, res) => {
  try {
    const { nickname, identificationId, predictionIndex, environment } = req.body;

    // Check 50 plant limit
    const plantCount = await Plant.countUserPlants(req.user._id);
    if (plantCount >= 50) {
      return res.status(400).json({ 
        message: 'Plant library is full. Maximum 50 plants allowed in Version 1.0.' 
      });
    }

    // Get identification record
    const identification = await Identification.findOne({
      _id: identificationId,
      user: req.user._id
    });

    if (!identification) {
      return res.status(404).json({ message: 'Identification record not found' });
    }

    const selectedIndex = predictionIndex || 0;
    const prediction = identification.predictions[selectedIndex];

    if (!prediction) {
      return res.status(400).json({ message: 'Invalid prediction selection' });
    }

    // Create plant profile
    const plant = await Plant.create({
      user: req.user._id,
      nickname: nickname || prediction.commonName,
      species: {
        commonName: prediction.commonName,
        scientificName: prediction.scientificName,
        description: prediction.description,
        confidence: prediction.confidence
      },
      environment: environment || {},
      imageUrl: identification.imageUrl,
      generalCare: prediction.generalCare || {},
      identificationHistory: [{
        imageUrl: identification.imageUrl,
        predictions: identification.predictions,
        createdAt: identification.createdAt
      }]
    });

    // Update identification record
    identification.addedToLibrary = true;
    identification.selectedPrediction = selectedIndex;
    identification.plantId = plant._id;
    await identification.save();

    res.status(201).json({
      message: 'Plant added to your library',
      plant
    });
  } catch (error) {
    console.error('Add to Library Error:', error);
    res.status(500).json({ message: 'Failed to add plant to library' });
  }
};

// GET /api/plants/history — Get identification history
const getHistory = async (req, res) => {
  try {
    const history = await Identification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ history });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch identification history' });
  }
};

// GET /api/plants/:id — Get single plant details
const getPlant = async (req, res) => {
  try {
    const plant = await Plant.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('diagnosisReports');

    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    res.json({ plant });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch plant details' });
  }
};

// DELETE /api/plants/:id — Remove plant from library
const removePlant = async (req, res) => {
  try {
    const plant = await Plant.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    res.json({ message: 'Plant removed from library' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove plant' });
  }
};

module.exports = { identify, reidentify, getLibrary, addToLibrary, getHistory, getPlant, removePlant };
