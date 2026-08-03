const readline = require('readline');
const { google } = require('googleapis');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== Google Drive OAuth2 Refresh Token Helper ===\n');

rl.question('Enter your GOOGLE_DRIVE_CLIENT_ID: ', (clientId) => {
  rl.question('Enter your GOOGLE_DRIVE_CLIENT_SECRET: ', (clientSecret) => {
    const redirectUri = 'https://developers.google.com/oauthplayground';
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive'],
      prompt: 'consent'
    });

    console.log('\n1. Open this URL in your browser:\n');
    console.log(authUrl);
    console.log('\n2. Sign in with your Google account and grant permissions.');
    console.log('3. After authorizing, Google will redirect you. Copy the "code" parameter or authorization code from OAuth Playground.\n');

    rl.question('Enter the authorization code here: ', async (code) => {
      try {
        const { tokens } = await oauth2Client.getToken(code.trim());
        console.log('\n=== SUCCESS! Here is your REFRESH TOKEN ===\n');
        console.log('GOOGLE_DRIVE_REFRESH_TOKEN=' + tokens.refresh_token);
        console.log('\nCopy the values above into your backend/.env file!');
      } catch (err) {
        console.error('\nError retrieving refresh token:', err.message);
      }
      rl.close();
    });
  });
});
