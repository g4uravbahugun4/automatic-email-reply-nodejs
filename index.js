const express = require('express');
const dotenv = require('dotenv');
const {
    getGoogleAuthUrl,
    setGoogleCredentials,
    getGoogleOAuthClient,
    loadTokens,
    refreshAccessToken
} = require('./googleOAuth');
const { getOutlookAuthUrl, setOutlookCredentials } = require('./outlookOAuth');
const { Worker, Queue } = require('bullmq');
const { processEmails } = require('./emailProcessor');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;


loadTokens();

app.get('/auth/google', (req, res) => {
    const url = getGoogleAuthUrl();
    res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
    const code = req.query.code;
    await setGoogleCredentials(code);
    res.send('Google OAuth successful');
});

app.get('/auth/outlook', (req, res) => {
    const url = getOutlookAuthUrl();
    res.redirect(url);
});

app.get('/auth/outlook/callback', async (req, res) => {
    const code = req.query.code;
    await setOutlookCredentials(code);
    res.send('Outlook OAuth successful');
});

const REDIS_HOST = '127.0.0.1';
const REDIS_PORT = 6379;

const emailQueue = new Queue('emailQueue', {
    connection: {
        host: REDIS_HOST,
        port: REDIS_PORT
    }
});

emailQueue.add('checkEmails', {}, { repeat: { cron: '*/5 * * * *' } });

const worker = new Worker('emailQueue', async job => {
    if (job.name === 'checkEmails') {
        const googleOAuthClient = getGoogleOAuthClient();


        if (!googleOAuthClient.credentials.access_token || (googleOAuthClient.credentials.expiry_date && googleOAuthClient.credentials.expiry_date <= (Date.now() + 60000))) {
            await refreshAccessToken();
        }

        await processEmails(googleOAuthClient);
    }
}, {
    connection: {
        host: REDIS_HOST,
        port: REDIS_PORT
    }
});


worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed with error ${err.message}`);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
