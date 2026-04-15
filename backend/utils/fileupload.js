const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("=== DESTINATION ===");
    console.log("req.body is empty here - storing in temp folder");
    console.log("Will move to correct folder in controller based on req.body.uploadType");
    
    // Store in temp folder - will be moved in controller
    const tempPath = path.join(__dirname, '../uploads/templates/temp');
    // console.log("Temp path:", req);
    
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }
    console.log("Temp path:", file);
    
    console.log("Temp destination:", tempPath);
    cb(null, tempPath);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/\s+/g, '_');
    const finalFileName = originalName.toUpperCase();
    
    console.log("=== FILENAME ===");
    console.log("Generated:", finalFileName);
    
    cb(null, finalFileName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB per file
    files: 100                    // max 100 files per request
  },
  fileFilter: function (req, file, cb) {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

module.exports = upload;