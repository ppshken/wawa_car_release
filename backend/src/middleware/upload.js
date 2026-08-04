const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const uploadDir = path.join(__dirname, '../../uploads');
const uploadUserDir = path.join(uploadDir, 'user');
const uploadVehiclesDir = path.join(uploadDir, 'vehicles');

const MAX_IMAGE_WIDTH = 1200;
const MAX_IMAGE_HEIGHT = 1200;
const IMAGE_QUALITY = 85;

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(uploadUserDir)) fs.mkdirSync(uploadUserDir, { recursive: true });
if (!fs.existsSync(uploadVehiclesDir)) fs.mkdirSync(uploadVehiclesDir, { recursive: true });

function getSubDir(req, file) {
  let subDir = '';
  const fullUrl = req.originalUrl || req.baseUrl || req.path || '';
  if (fullUrl.includes('user') || file.fieldname.includes('user')) {
    subDir = 'user';
  } else if (fullUrl.includes('vehicle') || fullUrl.includes('car') || file.fieldname.includes('car') || file.fieldname.includes('vehicle')) {
    subDir = 'vehicles';
  }
  return subDir;
}

function ensureDir(targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  return targetDir;
}

function isImageFile(file) {
  const mimeType = (file.mimetype || '').toLowerCase();
  const fileName = (file.originalname || '').toLowerCase();
  return ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType) || /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName);
}

async function resizeImageBuffer(buffer, originalName = '') {
  const image = sharp(buffer);
  const metadata = await image.metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;

  let resizedImage = image;
  if (width > MAX_IMAGE_WIDTH || height > MAX_IMAGE_HEIGHT) {
    resizedImage = resizedImage.resize({
      width: MAX_IMAGE_WIDTH,
      height: MAX_IMAGE_HEIGHT,
      fit: 'inside',
      withoutEnlargement: true
    });
  }

  const format = metadata.format === 'png'
    ? 'png'
    : metadata.format === 'webp'
      ? 'webp'
      : 'jpeg';

  if (format === 'png') {
    return resizedImage.png({ compressionLevel: 9 }).toBuffer();
  }

  if (format === 'webp') {
    return resizedImage.webp({ quality: IMAGE_QUALITY }).toBuffer();
  }

  return resizedImage.jpeg({ quality: IMAGE_QUALITY }).toBuffer();
}

const storage = {
  _handleFile(req, file, cb) {
    const subDir = getSubDir(req, file);
    const targetDir = ensureDir(subDir ? path.join(uploadDir, subDir) : uploadDir);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = isImageFile(file)
      ? `img-${uniqueSuffix}${ext}`
      : (file.originalname || `file-${uniqueSuffix}${ext}`);
    const filePath = path.join(targetDir, filename);

    const buffers = [];
    file.stream.on('data', (chunk) => buffers.push(chunk));
    file.stream.on('error', cb);
    file.stream.on('end', async () => {
      try {
        const buffer = Buffer.concat(buffers);
        const outputBuffer = isImageFile(file) ? await resizeImageBuffer(buffer, file.originalname) : buffer;

        fs.writeFileSync(filePath, outputBuffer);
        cb(null, {
          filename,
          path: filePath,
          size: outputBuffer.length,
          mimetype: file.mimetype,
          subDir
        });
      } catch (error) {
        cb(error);
      }
    });
  },
  _removeFile(req, file, cb) {
    if (file.path) {
      fs.unlink(file.path, cb);
    } else {
      cb(null);
    }
  }
};

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
  if (allowed.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|webp|gif|xlsx|csv)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Only image and spreadsheet files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

// Helper function to save base64 data to local disk
async function saveBase64Image(base64Str, subDir = '') {
  if (!base64Str) return null;
  if (!base64Str.startsWith('data:')) {
    return base64Str; // Already a URL or filename
  }

  const matches = base64Str.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return null;

  const mimeType = matches[1].toLowerCase();
  const data = Buffer.from(matches[2], 'base64');
  const isImage = mimeType.startsWith('image/');

  const extMap = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'text/plain': 'txt',
    'text/csv': 'csv',
    'application/json': 'json',
  };
  const ext = extMap[mimeType] || 'bin';
  const filename = `${isImage ? 'img' : 'file'}-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

  const targetDir = ensureDir(subDir ? path.join(uploadDir, subDir) : uploadDir);
  const filePath = path.join(targetDir, filename);
  const outputBuffer = isImage ? await resizeImageBuffer(data, `image.${ext}`) : data;
  fs.writeFileSync(filePath, outputBuffer);

  return subDir ? `/uploads/${subDir}/${filename}` : `/uploads/${filename}`;
}

module.exports = {
  upload,
  saveBase64Image
};
