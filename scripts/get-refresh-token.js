
const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const destroyer = require('server-destroy');
const open = require('open');

// PASTE YOUR CREDENTIALS HERE FOR ONE-TIME SETUP
// OR PASS AS ENV VARS: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

if (CLIENT_ID === 'YOUR_CLIENT_ID') {
    console.error('❌ Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment or edit this script.');
    process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

const scopes = ['https://www.googleapis.com/auth/drive.file']; // Or drive for full access

async function authenticate() {
    return new Promise((resolve, reject) => {
        const server = http.createServer(async (req, res) => {
            try {
                if (req.url.indexOf('/oauth2callback') > -1) {
                    const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
                    res.end('Authentication successful! You can close this tab and check your terminal.');
                    server.destroy();
                    const { tokens } = await oauth2Client.getToken(qs.get('code'));
                    resolve(tokens);
                }
            } catch (e) {
                reject(e);
            }
        }).listen(3000, () => {
            const authorizeUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline', // CRITICAL: Ensures we get a Refresh Token
                scope: scopes,
                prompt: 'consent' // CRITICAL: Forces consent screen to ensure refresh token
            });
            console.log('⏳ Waiting for authentication...');
            console.log(`👉 Please open this URL to authorize: \n\n${authorizeUrl}\n`);
            open(authorizeUrl);
        });
        destroyer(server);
    });
}

authenticate().then((tokens) => {
    console.log('\n✅ AUTHENTICATION SUCCESSFUL!');
    console.log('--------------------------------------------------');
    console.log('GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token);
    console.log('--------------------------------------------------');
    console.log('Add this token to your .env.local and Vercel Environment Variables.');
    if (!tokens.refresh_token) {
        console.warn('⚠️ No Refresh Token returned. Did you already authorize? Try revoking access or using prompt: "consent".');
    }
}).catch(console.error);
