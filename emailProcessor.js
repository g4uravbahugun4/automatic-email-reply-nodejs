const { getGoogleOAuthClient } = require('./googleOAuth.js');
const { getOutlookClient } = require('./outlookOAuth.js');
const { analyzeEmailContent, generateReply } = require('./openAi.js');
const { sendEmail } = require('./utils/sendMail.js'); 
const { google } = require('googleapis');

async function processEmails(oAuth2Client) {
   
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const gmailResponse = await gmail.users.messages.list({ userId: 'me', q: 'is:unread' });

    if (gmailResponse.data.messages && gmailResponse.data.messages.length) {
        for (const message of gmailResponse.data.messages) {
          
            const email = await gmail.users.messages.get({ userId: 'me', id: message.id });
            console.log("email",email)
            const emailContent = email.data.snippet;
            const label = await analyzeEmailContent(emailContent);
            const reply = await generateReply(emailContent, label);
            await sendEmail('gmail', email.data, reply, label, oAuth2Client);
            await gmail.users.messages.modify({
                userId: 'me',
                id: message.id,
                resource: {
                    removeLabelIds: ['UNREAD']
                }
            });
        }
    } else {
        console.log('No unread Gmail messages found.');
    }

    // Process Outlook emails (commented out for now)
    // const outlookClient = getOutlookClient();
    // const outlookResponse = await outlookClient.api('/me/messages').filter("isRead eq false").get();
    // for (const email of outlookResponse.value) {
    //     const emailContent = email.body.content;
    //     const label = await analyzeEmailContent(emailContent);
    //     const reply = await generateReply(emailContent);
    //     await sendEmail('outlook', email, reply, label);
    // }
}

module.exports = { processEmails };
