const Diagnosis = require('../models/Diagnosis');
const Plant = require('../models/Plant');
const { diagnosePlantHealth } = require('../utils/groqService');
const crypto = require('crypto');

// POST /api/diagnosis/analyze — Upload image and diagnose health
const analyze = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a plant image' });
    }

    const { plantId } = req.body;
    const imagePath = req.file.path;
    const imageUrl = `/uploads/${req.file.filename}`;

    // Get species info if plant is in library
    let speciesInfo = '';
    let plant = null;
    if (plantId) {
      plant = await Plant.findOne({ _id: plantId, user: req.user._id });
      if (plant) {
        speciesInfo = `${plant.species.commonName} (${plant.species.scientificName})`;
      }
    }

    // Call Groq API for diagnosis
    const result = await diagnosePlantHealth(imagePath, speciesInfo);

    // Create diagnosis record
    const diagnosis = await Diagnosis.create({
      user: req.user._id,
      plant: plantId || null,
      imageUrl,
      overallHealth: result.overallHealth || 'Healthy',
      conditions: result.conditions || [],
      summary: result.summary || 'Analysis complete.'
    });

    res.json({
      message: 'Health diagnosis complete',
      diagnosis: {
        id: diagnosis._id,
        imageUrl,
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

// POST /api/diagnosis/rediagnose/:plantId — Re-diagnose with new image
const rediagnose = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a new plant image' });
    }

    const { plantId } = req.params;
    const imagePath = req.file.path;
    const imageUrl = `/uploads/${req.file.filename}`;

    const plant = await Plant.findOne({ _id: plantId, user: req.user._id });
    const speciesInfo = plant 
      ? `${plant.species.commonName} (${plant.species.scientificName})` 
      : '';

    const result = await diagnosePlantHealth(imagePath, speciesInfo);

    const diagnosis = await Diagnosis.create({
      user: req.user._id,
      plant: plantId,
      imageUrl,
      overallHealth: result.overallHealth || 'Healthy',
      conditions: result.conditions || [],
      summary: result.summary || 'Re-diagnosis complete.'
    });

    res.json({
      message: 'Re-diagnosis complete',
      diagnosis: {
        id: diagnosis._id,
        imageUrl,
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

// GET /api/diagnosis/plant/:plantId — Get diagnosis history for a plant
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

// GET /api/diagnosis/history — Get all diagnosis history for user
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

// GET /api/diagnosis/:id — Get single diagnosis report
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

// PUT /api/diagnosis/:id/save — Save report to plant profile
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

    // Link to plant if exists
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

// GET /api/diagnosis/:id/share — Generate shareable link
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

// GET /api/diagnosis/shared/:token — View shared diagnosis (public)
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
