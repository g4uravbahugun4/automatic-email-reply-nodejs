// src/utils.ts
const { google } = require('googleapis');
const { getGoogleOAuthClient } = require('../googleOAuth.js');
const { getOutlookClient } = require('../outlookOAuth.js');

const sendGmail = async (email, reply, oAuth2Client) => {
    const gmailClient = getGoogleOAuthClient();
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const raw = Buffer.from(
        `From: me\nTo: ${email.payload.headers.find((header) => header.name === 'From').value}\nSubject: Re: ${email.payload.headers.find((header) => header.name === 'Subject').value}\n\n${reply}`
    ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: raw,
        },
    });
};

const sendOutlook = async (email, reply) => {
    const outlookClient = getOutlookClient();

    const message = {
        subject: `Re: ${email.subject}`,
        toRecipients: [{ emailAddress: { address: email.from.emailAddress.address } }],
        body: { contentType: 'Text', content: reply }
    };

    await outlookClient.api('/me/sendMail').post({ message });
};

const sendEmail = async (provider, email, reply, label, oAuth2Client) => {
    if (provider === 'gmail') {
        await sendGmail(email, reply, oAuth2Client);
    } else if (provider === 'outlook') {
        await sendOutlook(email, reply, oAuth2Client);
    }

    console.log(`Email sent with label: ${label}`);
};

module.exports = { sendEmail };