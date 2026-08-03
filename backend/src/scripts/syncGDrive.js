require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const { isConfigured, uploadFileToDrive } = require('../services/googleDriveService');

const uploadDir = path.join(__dirname, '../../uploads');

async function syncAllImages() {
  console.log('--- Google Drive Batch Image Sync ---');
  if (!isConfigured()) {
    console.error('ERROR: Google Drive credentials are not configured in .env');
    console.error('Please set GOOGLE_DRIVE_CLIENT_EMAIL, GOOGLE_DRIVE_PRIVATE_KEY, and GOOGLE_DRIVE_FOLDER_ID in .env');
    process.exit(1);
  }

  function getAllFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        getAllFiles(filePath, fileList);
      } else {
        if (file.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
          fileList.push(filePath);
        }
      }
    });
    return fileList;
  }

  const allImages = getAllFiles(uploadDir);
  console.log(`Found ${allImages.length} images in ${uploadDir}`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < allImages.length; i++) {
    const file = allImages[i];
    const relPath = path.relative(uploadDir, file);
    const ext = path.extname(file).toLowerCase().replace('.', '');
    const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

    console.log(`[${i + 1}/${allImages.length}] Uploading ${relPath}...`);
    const res = await uploadFileToDrive(file, mimeType, path.basename(file));
    if (res.success) {
      console.log(` -> SUCCESS! File ID: ${res.fileId}`);
      successCount++;
    } else {
      console.error(` -> FAILED: ${res.error}`);
      failCount++;
    }
  }

  console.log('\n--- Sync Summary ---');
  console.log(`Total: ${allImages.length}`);
  console.log(`Successfully Uploaded: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

syncAllImages().catch(err => {
  console.error('Fatal sync error:', err);
});
