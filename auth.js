// auth.js
const express = require('express');
const axios = require('axios');
const open = require('open');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 8081;

// Utility: Get local IP (e.g., 192.168.1.x)
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

const localIp = getLocalIp() || 'localhost';
const REDIRECT_URI = `http://${localIp}:${PORT}/callback`;

app.use(express.urlencoded({ extended: true }));
app.use('/auth.css', express.static(path.join(__dirname, 'auth.css')));
app.use('/logo.svg', express.static(path.join(__dirname, 'logo.svg')));

// Serve HTML form for credentials
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>MMM-TickTick Authentication</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="stylesheet" href="/auth.css">
    </head>
    <body>
      <div class="container">
          <div class="box">
            <img src="/logo.svg" alt="TickTick Logo" />
            <h2>Authentication</h2>
            <form action="/auth" method="post">
              <label>Client ID:</label>
              <input name="clientId" placeholder="Client ID..." required>
              <label>Client Secret:</label>
              <input name="clientSecret" placeholder="Client Secret..." required>
              <button type="submit">Authorize</button>
            </form>
            <p class="small"><a href="https://developer.ticktick.com/manage" target="_blank">Click here</a> to register your application and obtain a Client ID and Client Secret.</p>
            <p class="small">OAuth redirect URL: <code>http://${localIp}:${PORT}/callback</code></p>
          </div>
      </div>
    </body>
    </html>
  `);
});

// Handle form submission and start OAuth flow
app.post('/auth', (req, res) => {
  const { clientId, clientSecret } = req.body;
  const authUrl =
    `https://ticktick.com/oauth/authorize?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code&scope=tasks:read`;

  // Store these temporarily in memory
  app.locals.clientId = clientId;
  app.locals.clientSecret = clientSecret;

  res.redirect(authUrl);
  res.send(`Please authorize in the browser… If it doesn't open automatically, <a href="${authUrl}" target="_blank">click here</a>.`);
});

// Handle the OAuth callback
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  const { clientId, clientSecret } = app.locals;

  if (!code || !clientId || !clientSecret) {
    return res.status(400).send('Missing authorization code or credentials');
  }

  try {
    console.log('Exchanging authorization code for tokens...');
    const tokenRes = await axios.post('https://ticktick.com/oauth/token', null, {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      },
    });

    console.log('Tokens received successfully:', {
      access_token: tokenRes.data.access_token ? '✓' : '✗',
      expires_in: tokenRes.data.expires_in
    });

    fs.writeFileSync(path.join(__dirname, 'token.json'), JSON.stringify(tokenRes.data, null, 2));
    res.send('✅ Authorization successful! You can close this window.');
    console.log('Token saved to token.json');
    process.exit(0);
  } catch (err) {
    console.error('Token exchange failed:', (err.response && err.response.data) || err.message);
    res.send('❌ Authorization failed. Check console.');
    process.exit(1);
  }
});

app.listen(PORT, () => {
  console.log(`Open http://${localIp}:${PORT}/ in your browser to authenticate. Use http://${localIp}:${PORT}/callback as your OAuth redirect URL in TickTick App.`);
});
