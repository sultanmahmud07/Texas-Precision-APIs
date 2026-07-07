import { google } from 'googleapis';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error("❌ Missing Google credentials (GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET) in your .env file.");
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

const run = async () => {
  try {
    console.log('\nSelect the Redirect URI (must be registered in Google Cloud Console under "Authorized redirect URIs"):');
    console.log(`1. ${GOOGLE_CALLBACK_URL} (from .env)`);
    
    // Try to derive the standard /auth callback path which might be registered in Google Cloud Console
    const derivedAuthUrl = GOOGLE_CALLBACK_URL 
      ? GOOGLE_CALLBACK_URL.replace('/inspection/google/callback', '/auth/google/callback')
      : 'https://api.devshimul.com/api/v1/auth/google/callback';
    console.log(`2. ${derivedAuthUrl} (Standard auth callback, likely registered if Google sign-in works)`);
    console.log(`3. Enter a custom redirect URL`);
    
    const choice = await askQuestion('\nChoose option (1, 2, or 3): ');
    let callbackUrl = GOOGLE_CALLBACK_URL || '';
    
    if (choice.trim() === '2') {
      callbackUrl = derivedAuthUrl;
    } else if (choice.trim() === '3') {
      const customUrl = await askQuestion('Enter custom redirect URL: ');
      callbackUrl = customUrl.trim();
    }
    
    if (!callbackUrl) {
      console.error("❌ Callback URL is required.");
      rl.close();
      process.exit(1);
    }

    console.log(`\nUsing Redirect URI: ${callbackUrl}`);

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      callbackUrl
    );

    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent', // Forces Google to provide a refresh token
      scope: scopes,
    });

    console.log('\n🚀 Step 1: Open the following URL in your browser to authorize Google Calendar access:\n');
    console.log(authUrl);
    console.log('\n--------------------------------------------------------------------------------');
    console.log('Note: If the page loads a "404" or connection error after logging in, that is fine!');
    console.log('Just look at your browser address bar and copy the value of the "code" query parameter.');
    console.log('--------------------------------------------------------------------------------\n');

    const code = await askQuestion('👉 Step 2: Paste the "code" query parameter value here: ');
    rl.close();

    const { tokens } = await oauth2Client.getToken(code.trim());
    console.log('\n🎉 Success! Credentials retrieved:\n');
    console.log('GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token);
    console.log('\nAction required:');
    console.log('1. Copy the GOOGLE_REFRESH_TOKEN value above.');
    console.log('2. Paste it in your .env file replacing the current GOOGLE_REFRESH_TOKEN.');
    console.log('3. Restart your server.\n');
  } catch (err) {
    console.error('❌ Error:', err);
    rl.close();
  }
};

run();
