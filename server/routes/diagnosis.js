const express = require('express');
const router = express.Router();
const {
  analyze,
  rediagnose,
  getPlantDiagnoses,
  getAllDiagnoses,
  getDiagnosis,
  saveDiagnosis,
  shareDiagnosis,
  viewSharedDiagnosis
} = require('../controllers/diagnosisController');
const { protect } = require('../middleware/auth');
const upload = require('../config/multer');

// Public route for shared reports
router.get('/shared/:token', viewSharedDiagnosis);

// Protected routes
router.post('/analyze', protect, upload.single('image'), analyze);
router.post('/rediagnose/:plantId', protect, upload.single('image'), rediagnose);
router.get('/history', protect, getAllDiagnoses);
router.get('/plant/:plantId', protect, getPlantDiagnoses);
router.get('/:id', protect, getDiagnosis);
router.put('/:id/save', protect, saveDiagnosis);
router.get('/:id/share', protect, shareDiagnosis);

module.exports = router;
