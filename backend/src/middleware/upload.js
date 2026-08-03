const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads');
const uploadUserDir = path.join(uploadDir, 'user');
const uploadVehiclesDir = path.join(uploadDir, 'vehicles');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(uploadUserDir)) fs.mkdirSync(uploadUserDir, { recursive: true });
if (!fs.existsSync(uploadVehiclesDir)) fs.mkdirSync(uploadVehiclesDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let subDir = '';
    const fullUrl = req.originalUrl || req.baseUrl || req.path || '';
    if (fullUrl.includes('user') || file.fieldname.includes('user')) {
      subDir = 'user';
    } else if (fullUrl.includes('vehicle') || fullUrl.includes('car') || file.fieldname.includes('car') || file.fieldname.includes('vehicle')) {
      subDir = 'vehicles';
    }

    const targetDir = subDir ? path.join(uploadDir, subDir) : uploadDir;
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    file.subDir = subDir;
    cb(null, targetDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'img-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
  if (allowed.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|webp|gif|xlsx|csv)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Only image and spreadsheet files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// Helper function to save base64 image data to local disk
function saveBase64Image(base64Str, subDir = '') {
  if (!base64Str) return null;
  if (!base64Str.startsWith('data:image')) {
    return base64Str; // Already a URL or filename
  }
  const matches = base64Str.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return null;

  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const data = Buffer.from(matches[2], 'base64');
  const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

  const targetDir = subDir ? path.join(uploadDir, subDir) : uploadDir;
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, filename);
  fs.writeFileSync(filePath, data);

  return subDir ? `/uploads/${subDir}/${filename}` : `/uploads/${filename}`;
}

module.exports = {
  upload,
  saveBase64Image
};
