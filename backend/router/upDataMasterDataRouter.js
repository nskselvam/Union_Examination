const router = require('express').Router();
const { upDataMasterDataController } = require('../controller/upDataMasterDataController');
const { protect } = require('../middleware/authMiddleware');
router.put('/subcode', protect, upDataMasterDataController);
module.exports = router;