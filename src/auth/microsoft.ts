import express from 'express';
import axios from 'axios';

const router = express.Router();

const CLIENT_ID = process.env.MSCLIENT_ID || '';
const CLIENT_SECRET = process.env.MSCLIENT_SECRET || '';
const REDIRECT_URI = process.env.MS_REDIRECT_URI || 'http://localhost:3000/auth/microsoft/callback';
const SCOPES = ['https://graph.microsoft.com/Mail.Send', 'offline_access', 'openid', 'profile', 'email'];

router.get('/login', (_req, res) => {
  const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${encodeURIComponent(CLIENT_ID)}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_mode=query&scope=${encodeURIComponent(SCOPES.join(' '))}`;
  res.redirect(url);
});

router.get('/callback', async (req, res) => {
  const code = req.query.code as string | undefined;
  if (!code) return res.status(400).send('Missing code');

  try {
    const tokenResp = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', new URLSearchParams({
      client_id: CLIENT_ID,
      scope: SCOPES.join(' '),
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
      client_secret: CLIENT_SECRET
    }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

    // For demo: store tokens in session
    (req.session as any).msTokens = tokenResp.data;
    res.redirect('/');
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
});

export default router;
