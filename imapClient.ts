import Imap from 'imap-simple';
import { simpleParser } from 'mailparser';

const user = process.env.IMAP_USER || process.env.SMTP_USER;
const pass = process.env.IMAP_PASS || process.env.SMTP_PASS;
const host = process.env.IMAP_HOST || 'outlook.office365.com';
const port = process.env.IMAP_PORT ? parseInt(process.env.IMAP_PORT, 10) : 993;

if (!user || !pass) {
  console.warn('Warning: IMAP_USER or IMAP_PASS not set. Fetching will fail until configured.');
}

const config = {
  imap: {
    user,
    password: pass,
    host,
    port,
    tls: true,
    authTimeout: 3000
  }
};

export default {
  fetchRecent: async (limit = 10) => {
    const conn = await Imap.connect(config as any);
    try {
      await conn.openBox('INBOX');
      const searchCriteria = ['ALL'];
      const fetchOptions = { bodies: [''], markSeen: false } as any;
      const results = await conn.search(searchCriteria as any, fetchOptions as any);
      const items = results.slice(-limit).reverse();
      const parsed: any[] = [];
      for (const item of items) {
        const all = item.parts ? item.parts.find((p: any) => p.which === '') : undefined;
        if (!all || !all.body) {
          // skip malformed item
          continue;
        }
        const parsedMail = await simpleParser(all.body);
        parsed.push({
          subject: parsedMail.subject,
          from: parsedMail.from && parsedMail.from.text,
          date: parsedMail.date,
          text: parsedMail.text,
          html: parsedMail.html
        });
      }
      await conn.end();
      return parsed;
    } catch (err) {
      await conn.end();
      throw err;
    }
  }
};
