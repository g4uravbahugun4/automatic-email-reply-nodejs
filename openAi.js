const { OpenAI } = require('openai');
const dotenv = require('dotenv');
dotenv.config();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY 
});

async function analyzeEmailContent(emailContent) {
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        
        messages: [{ role: "user", content: `Categorize the following email content into one of the following labels: Interested, Not Interested, More information.\n\nEmail content: ${emailContent}` }]
    });
    return response.choices[0].message.content;
}

async function generateReply(emailContent, label) {
    let prompt;

    switch (label) {
        case 'Interested':
            prompt = `Generate a polite and engaging reply for an email according to the email content. Email content: ${emailContent}`;
            break;
        case 'Not Interested':
            prompt = `Generate a polite and engaging reply for an email according to the email content.  Email content: ${emailContent}`;
            break;
        case 'More information':
            prompt = `Generate a polite and engaging reply for an email according to the email content.  Email content: ${emailContent}`;
            break;
        default:
            prompt = `Generate a polite and engaging reply for an email according to the email content. : ${emailContent}`;
            break;
    }

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        
        messages:[{role:"user",content:prompt}]
        
    });

    return response.choices[0].message.content;
}

module.exports = { analyzeEmailContent, generateReply };
