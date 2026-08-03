require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { google } = require('googleapis');
const fs = require('fs');

async function testAuth() {
  const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  console.log('Client Email:', clientEmail);
  console.log('Folder ID:', folderId);

  if (privateKey) {
    privateKey = privateKey.trim();
    if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
      privateKey = privateKey.substring(1, privateKey.length - 1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive']
  });

  try {
    const tokens = await auth.authorize();
    console.log('Successfully authorized with Google Drive API!');

    const drive = google.drive({ version: 'v3', auth });

    console.log('Attempting upload to Folder ID:', folderId);
    const testRes = await drive.files.create({
      requestBody: {
        name: 'test-wawa-sync.txt',
        parents: [folderId]
      },
      media: {
        mimeType: 'text/plain',
        body: 'Test Google Drive upload from Wawa Car Release'
      },
      supportsAllDrives: true,
      fields: 'id, name, webViewLink'
    });
    console.log('Upload Test SUCCESSFUL! File Info:', testRes.data);
  } catch (err) {
    console.error('Upload Test FAILED with error:', err.message);
  }
}

testAuth();
