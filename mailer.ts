import nodemailer from 'nodemailer';

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpHost = process.env.SMTP_HOST || 'smtp.office365.com';
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;

if (!smtpUser || !smtpPass) {
  console.warn('Warning: SMTP_USER or SMTP_PASS not set. Sending will fail until configured.');
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  }
});

type MailOptions = {
  from?: string;
  to: string;
  subject?: string;
  text?: string;
  html?: string;
};

export default {
  sendMail: async ({ from, to, subject, text, html }: MailOptions) => {
    const mail = {
      from: from || smtpUser,
      to,
      subject,
      text,
      html,
    } as any;
    return transporter.sendMail(mail);
  }
};
