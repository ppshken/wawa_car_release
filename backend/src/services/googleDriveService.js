const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

let driveClient = null;

function getAuth() {
  // Method 1: OAuth2 Refresh Token (Recommended for personal Gmail & Workspace accounts)
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    return oauth2Client;
  }

  // Method 2: Service Account Credentials File
  const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyFilePath && fs.existsSync(keyFilePath)) {
    return new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive']
    });
  }

  // Method 3: Service Account JWT (.env keys)
  const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY;

  if (clientEmail && privateKey) {
    privateKey = privateKey.trim();
    if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
      privateKey = privateKey.substring(1, privateKey.length - 1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    return new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive']
    });
  }

  return null;
}

function getDriveClient() {
  const auth = getAuth();
  if (!auth) return null;

  return google.drive({ version: 'v3', auth });
}

function isConfigured() {
  return !!getAuth();
}

/**
 * Upload a local file to Google Drive
 * @param {string} filePath Absolute path to the local file
 * @param {string} mimeType File MIME type
 * @param {string} customName File name in Google Drive
 * @returns {Promise<{success: boolean, fileId?: string, webViewLink?: string, error?: string}>}
 */
async function uploadFileToDrive(filePath, mimeType = 'image/jpeg', customName = null) {
  try {
    const drive = getDriveClient();
    if (!drive) {
      return { success: false, error: 'Google Drive is not configured in .env' };
    }

    if (!fs.existsSync(filePath)) {
      return { success: false, error: `File not found: ${filePath}` };
    }

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || null;
    const fileName = customName || path.basename(filePath);

    const requestBody = {
      name: fileName,
      ...(folderId ? { parents: [folderId] } : {})
    };

    const media = {
      mimeType: mimeType || 'image/jpeg',
      body: fs.createReadStream(filePath)
    };

    const res = await drive.files.create({
      requestBody,
      media,
      supportsAllDrives: true,
      fields: 'id, name, webViewLink, webContentLink'
    });

    const fileId = res.data.id;

    // Make file public viewable with link
    try {
      await drive.permissions.create({
        fileId: fileId,
        supportsAllDrives: true,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });
    } catch (permErr) {
      console.warn('Google Drive permission set warning:', permErr.message);
    }

    return {
      success: true,
      fileId,
      webViewLink: res.data.webViewLink,
      webContentLink: res.data.webContentLink
    };
  } catch (err) {
    console.error('Google Drive Upload File Error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Upload a Buffer to Google Drive
 * @param {Buffer} buffer File buffer
 * @param {string} mimeType File MIME type
 * @param {string} fileName File name in Google Drive
 * @returns {Promise<{success: boolean, fileId?: string, webViewLink?: string, error?: string}>}
 */
async function uploadBufferToDrive(buffer, mimeType = 'image/jpeg', fileName = 'upload.jpg') {
  try {
    const drive = getDriveClient();
    if (!drive) {
      return { success: false, error: 'Google Drive is not configured in .env' };
    }

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || null;
    const requestBody = {
      name: fileName,
      ...(folderId ? { parents: [folderId] } : {})
    };

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const media = {
      mimeType: mimeType,
      body: stream
    };

    const res = await drive.files.create({
      requestBody,
      media,
      supportsAllDrives: true,
      fields: 'id, name, webViewLink, webContentLink'
    });

    const fileId = res.data.id;

    try {
      await drive.permissions.create({
        fileId: fileId,
        supportsAllDrives: true,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });
    } catch (permErr) {
      console.warn('Google Drive permission set warning:', permErr.message);
    }

    return {
      success: true,
      fileId,
      webViewLink: res.data.webViewLink,
      webContentLink: res.data.webContentLink
    };
  } catch (err) {
    console.error('Google Drive Upload Buffer Error:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  isConfigured,
  uploadFileToDrive,
  uploadBufferToDrive
};
