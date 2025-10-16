import 'dotenv/config';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import cors from 'cors';

import mailer from './mailer';
import imapClient from './imapClient';
import session from 'express-session';
import msAuth from './src/auth/microsoft';
import { sendMailWithGraph } from './src/graph/sendMail';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// session (in-memory for demo only)
app.use(session({ secret: process.env.SESSION_SECRET || 'dev-secret', resave: false, saveUninitialized: false }));

// mount Microsoft OAuth routes
app.use('/auth/microsoft', msAuth);

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/send', async (req: Request, res: Response) => {
  const { to, subject, text, html } = req.body;
  try {
    // prefer Graph send if OAuth tokens are present in session
    const sessionAny: any = (req as any).session;
    if (sessionAny && sessionAny.msTokens && sessionAny.msTokens.access_token) {
      const graphResp = await sendMailWithGraph(sessionAny.msTokens.access_token, to, subject || '', text || '');
      res.json({ ok: true, info: graphResp });
      return;
    }

    const info = await mailer.sendMail({ to, subject, text, html });
    res.json({ ok: true, info });
  } catch (err: any) {
    console.error('send error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/messages', async (_req: Request, res: Response) => {
  try {
    const messages = await imapClient.fetchRecent();
    res.json({ ok: true, messages });
  } catch (err: any) {
    console.error('fetch error', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

if (require.main === module) {
  app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
}

export default app;
