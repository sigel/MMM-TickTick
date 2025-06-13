// auth.js
const express = require('express');
const axios = require('axios');
const open = require('open');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8081;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

app.use(express.urlencoded({ extended: true })); // form parsing middleware :contentReference[oaicite:1]{index=1}

// Serve HTML form for credentials
app.get('/', (req, res) => {
  res.send(`
    <h2>MMM‑TickTick Authentication</h2>
    <form action="/auth" method="post">
      <label>Client ID:<br><input name="clientId" required></label><br><br>
      <label>Client Secret:<br><input name="clientSecret" required></label><br><br>
      <button type="submit">Authorize</button>
    </form>
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

  open(authUrl);
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
    const tokenRes = await axios.post('https://ticktick.com/oauth/token', null, {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      },
    });

    fs.writeFileSync(path.join(__dirname, 'token.json'), JSON.stringify(tokenRes.data, null, 2));
    res.send('✅ Authorization successful! You can close this window.');
    console.log('Token saved to token.json');
    process.exit(0);
  } catch (err) {
    console.error('Token exchange failed:', err.response?.data || err.message);
    res.send('❌ Authorization failed. Check console.');
    process.exit(1);
  }
});

app.listen(PORT, () => {
  console.log(`Open http://localhost:${PORT}/ in your browser to authenticate.`);
});
