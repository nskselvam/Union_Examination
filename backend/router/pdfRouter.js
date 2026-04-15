const router = require('express').Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { pdfValuationGenearate } = require('../controller/pdfController');

router.post('/valuation-report', protect, pdfValuationGenearate);

module.exports = router;

