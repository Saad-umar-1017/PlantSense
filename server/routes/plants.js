const express = require('express');
const router = express.Router();
const { identify, reidentify, getLibrary, addToLibrary, getHistory, getPlant, removePlant } = require('../controllers/plantController');
const { protect } = require('../middleware/auth');
const upload = require('../config/multer');

router.post('/identify', protect, upload.single('image'), identify);
router.post('/reidentify/:id', protect, upload.single('image'), reidentify);
router.get('/library', protect, getLibrary);
router.post('/library', protect, addToLibrary);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getPlant);
router.delete('/:id', protect, removePlant);

module.exports = router;
