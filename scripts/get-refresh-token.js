const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const destroyer = require('server-destroy');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Error: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not found in .env.local');
    process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

const scopes = ['https://www.googleapis.com/auth/drive.file'];

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
                access_type: 'offline',
                scope: scopes,
                prompt: 'consent'
            });
            console.log('⏳ Waiting for authentication...');
            console.log(`👉 PLEASE CLICK THIS LINK to authorize: \n\n${authorizeUrl}\n`);
            // Removed to avoid ESM/CommonJS issues
        });
        destroyer(server);
    });
}

authenticate().then((tokens) => {
    console.log('\n✅ AUTHENTICATION SUCCESSFUL!');
    console.log('Token:', tokens.refresh_token);

    if (tokens.refresh_token) {
        // Auto-save to .env.local
        const envPath = path.join(process.cwd(), '.env.local');
        let envContent = fs.readFileSync(envPath, 'utf8');

        // Remove existing token if present
        envContent = envContent.replace(/^GOOGLE_REFRESH_TOKEN=.*$/gm, '');
        // Append new token
        envContent += `\nGOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"\n`;

        fs.writeFileSync(envPath, envContent);
        console.log('✨ SUCCESS! GOOGLE_REFRESH_TOKEN has been saved to .env.local automatically.');
        console.log('You can now deploy or test uploads.');
    } else {
        console.warn('⚠️ No Refresh Token returned. Try revoking access and running again.');
    }
}).catch(console.error);
