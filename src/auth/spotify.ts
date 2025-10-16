import express from 'express';
import axios from 'axios';

const router = express.Router();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '';
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/auth/spotify/callback';
const SCOPES = ['user-read-email'];

router.get('/login', (_req, res) => {
  const url = `https://accounts.spotify.com/authorize?client_id=${encodeURIComponent(CLIENT_ID)}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES.join(' '))}`;
  res.redirect(url);
});

router.get('/callback', async (req, res) => {
  const code = req.query.code as string | undefined;
  if (!code) return res.status(400).send('Missing code');

  try {
    const tokenResp = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

    // store tokens in session for demo
    (req.session as any).spotifyTokens = tokenResp.data;
    res.redirect('/');
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
});

export default router;
