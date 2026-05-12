const Diagnosis = require('../models/Diagnosis');
const Plant = require('../models/Plant');
const { diagnosePlantHealth } = require('../utils/groqService');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Helper: convert uploaded file to base64 data URI
const fileToDataUri = (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
  return `data:${mime};base64,${buffer.toString('base64')}`;
};

// POST /api/diagnosis/analyze
const analyze = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a plant image' });
    }

    const { plantId } = req.body;
    const imagePath = req.file.path;
    const imageDataUri = fileToDataUri(imagePath);

    let speciesInfo = '';
    if (plantId) {
      const plant = await Plant.findOne({ _id: plantId, user: req.user._id });
      if (plant) {
        speciesInfo = `${plant.species.commonName} (${plant.species.scientificName})`;
      }
    }

    const result = await diagnosePlantHealth(imagePath, speciesInfo);

    // Clean up temp file
    try { fs.unlinkSync(imagePath); } catch (e) {}

    const diagnosisData = {
      user: req.user._id,
      imageUrl: imageDataUri,
      overallHealth: result.overallHealth || 'Healthy',
      conditions: result.conditions || [],
      summary: result.summary || 'Analysis complete.'
    };

    // Only add plant field if plantId is provided
    if (plantId) {
      diagnosisData.plant = plantId;
    }

    const diagnosis = await Diagnosis.create(diagnosisData);

    res.json({
      message: 'Health diagnosis complete',
      diagnosis: {
        id: diagnosis._id,
        imageUrl: imageDataUri,
        overallHealth: diagnosis.overallHealth,
        summary: diagnosis.summary,
        conditions: diagnosis.conditions,
        createdAt: diagnosis.createdAt
      }
    });
  } catch (error) {
    console.error('Diagnosis Error:', error);
    res.status(500).json({ message: error.message || 'Failed to diagnose plant health' });
  }
};

// POST /api/diagnosis/rediagnose/:plantId
const rediagnose = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a new plant image' });
    }

    const { plantId } = req.params;
    const imagePath = req.file.path;
    const imageDataUri = fileToDataUri(imagePath);

    const plant = await Plant.findOne({ _id: plantId, user: req.user._id });
    const speciesInfo = plant 
      ? `${plant.species.commonName} (${plant.species.scientificName})` 
      : '';

    const result = await diagnosePlantHealth(imagePath, speciesInfo);

    try { fs.unlinkSync(imagePath); } catch (e) {}

    const diagnosis = await Diagnosis.create({
      user: req.user._id,
      plant: plantId,
      imageUrl: imageDataUri,
      overallHealth: result.overallHealth || 'Healthy',
      conditions: result.conditions || [],
      summary: result.summary || 'Re-diagnosis complete.'
    });

    res.json({
      message: 'Re-diagnosis complete',
      diagnosis: {
        id: diagnosis._id,
        imageUrl: imageDataUri,
        overallHealth: diagnosis.overallHealth,
        summary: diagnosis.summary,
        conditions: diagnosis.conditions,
        createdAt: diagnosis.createdAt
      }
    });
  } catch (error) {
    console.error('Rediagnosis Error:', error);
    res.status(500).json({ message: error.message || 'Failed to re-diagnose plant' });
  }
};

// GET /api/diagnosis/plant/:plantId
const getPlantDiagnoses = async (req, res) => {
  try {
    const diagnoses = await Diagnosis.find({
      plant: req.params.plantId,
      user: req.user._id
    }).sort({ createdAt: -1 });

    res.json({ diagnoses });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch diagnosis history' });
  }
};

// GET /api/diagnosis/history
const getAllDiagnoses = async (req, res) => {
  try {
    const diagnoses = await Diagnosis.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('plant', 'nickname species.commonName imageUrl');

    res.json({ diagnoses });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch diagnosis history' });
  }
};

// GET /api/diagnosis/:id
const getDiagnosis = async (req, res) => {
  try {
    const diagnosis = await Diagnosis.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('plant', 'nickname species imageUrl');

    if (!diagnosis) {
      return res.status(404).json({ message: 'Diagnosis report not found' });
    }

    res.json({ diagnosis });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch diagnosis report' });
  }
};

// PUT /api/diagnosis/:id/save
const saveDiagnosis = async (req, res) => {
  try {
    const diagnosis = await Diagnosis.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!diagnosis) {
      return res.status(404).json({ message: 'Diagnosis report not found' });
    }

    diagnosis.isSaved = true;
    await diagnosis.save();

    if (diagnosis.plant) {
      await Plant.findByIdAndUpdate(diagnosis.plant, {
        $addToSet: { diagnosisReports: diagnosis._id }
      });
    }

    res.json({ message: 'Report saved to plant profile', diagnosis });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save diagnosis report' });
  }
};

// GET /api/diagnosis/:id/share
const shareDiagnosis = async (req, res) => {
  try {
    const diagnosis = await Diagnosis.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!diagnosis) {
      return res.status(404).json({ message: 'Diagnosis report not found' });
    }

    if (!diagnosis.shareToken) {
      diagnosis.shareToken = crypto.randomBytes(16).toString('hex');
      await diagnosis.save();
    }

    res.json({
      shareToken: diagnosis.shareToken,
      shareUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/shared/diagnosis/${diagnosis.shareToken}`,
      disclaimer: 'This report is generated by PlantSense AI and is not a substitute for professional horticultural advice.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate share link' });
  }
};

// GET /api/diagnosis/shared/:token (public)
const viewSharedDiagnosis = async (req, res) => {
  try {
    const diagnosis = await Diagnosis.findOne({
      shareToken: req.params.token
    }).populate('plant', 'nickname species.commonName');

    if (!diagnosis) {
      return res.status(404).json({ message: 'Shared report not found or link expired' });
    }

    res.json({
      diagnosis: {
        overallHealth: diagnosis.overallHealth,
        summary: diagnosis.summary,
        conditions: diagnosis.conditions,
        imageUrl: diagnosis.imageUrl,
        plantName: diagnosis.plant?.nickname || diagnosis.plant?.species?.commonName || 'Unknown',
        createdAt: diagnosis.createdAt
      },
      disclaimer: 'This report is generated by PlantSense AI and is not a substitute for professional horticultural advice.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load shared report' });
  }
};

module.exports = {
  analyze,
  rediagnose,
  getPlantDiagnoses,
  getAllDiagnoses,
  getDiagnosis,
  saveDiagnosis,
  shareDiagnosis,
  viewSharedDiagnosis
};
