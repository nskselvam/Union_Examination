const route = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { paperReviewZero, paperReview, paperReviewDownload, paperReviewSearchBarcode } = require('../controller/paperReviewController');
route.get('/', protect, paperReview);
route.get('/paper-review-zero', protect, paperReviewZero);
route.get('/search-barcode', protect, paperReviewSearchBarcode);
route.post('/download', protect, paperReviewDownload);
module.exports = route;