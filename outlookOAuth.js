const { Client } = require('@microsoft/microsoft-graph-client');
const { TokenCredentialAuthenticationProvider } = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');
const { InteractiveBrowserCredential } =require( '@azure/identity');
const dotenv = require('dotenv');
const credential = new InteractiveBrowserCredential({
    clientId: process.env.OUTLOOK_CLIENT_ID,
    tenantId: process.env.OUTLOOK_TENANT_ID,
});

const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['Mail.Read', 'Mail.Send'],
});

const outlookClient = Client.initWithMiddleware({ authProvider });

 function getOutlookAuthUrl() {
    return `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}/oauth2/v2.0/authorize?client_id=${process.env.OUTLOOK_CLIENT_ID}&response_type=code&redirect_uri=${process.env.OUTLOOK_REDIRECT_URI}&response_mode=query&scope=openid+profile+offline_access+https://graph.microsoft.com/Mail.Read+https://graph.microsoft.com/Mail.Send`;
}

 async function setOutlookCredentials(code) {
    const tokenResponse = await credential.getToken({
        authorizationCode: code,
        redirectUri: process.env.OUTLOOK_REDIRECT_URI,
    });
    credential.token = tokenResponse.token;
    // Store token securely
}

 function getOutlookClient() {
    return outlookClient;
}

module.exports = {
    getOutlookAuthUrl,
    setOutlookCredentials,
    getOutlookClient,
};