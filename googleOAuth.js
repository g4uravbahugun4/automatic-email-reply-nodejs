const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

function loadTokens() {
    if (fs.existsSync(path.join(__dirname, 'tokens.json'))) {
        const tokens = JSON.parse(fs.readFileSync(path.join(__dirname, 'tokens.json')));
        oAuth2Client.setCredentials(tokens);
    }
}

function saveTokens(tokens) {
    fs.writeFileSync(path.join(__dirname, 'tokens.json'), JSON.stringify(tokens));
}


oAuth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      
        saveTokens(tokens);
    }
    console.log('Access Token:', tokens.access_token);
});

function getGoogleAuthUrl() {
    return oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.modify'],
    });
}

async function setGoogleCredentials(code) {
    try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        saveTokens(tokens); 
        return tokens;
    } catch (error) {
        console.error('Error setting Google credentials:', error);
        throw error;
    }
}

async function refreshAccessToken() {
    try {
        const tokens = await oAuth2Client.refreshAccessToken();
        oAuth2Client.setCredentials(tokens.credentials);
        saveTokens(tokens.credentials); 
        return tokens.credentials.access_token;
    } catch (error) {
        console.error('Error refreshing access token:', error);
        throw error;
    }
}


function getGoogleOAuthClient() {
    return oAuth2Client;
}

module.exports = {
    getGoogleAuthUrl,
    setGoogleCredentials,
    getGoogleOAuthClient,
    loadTokens,
    refreshAccessToken,
    saveTokens
};
