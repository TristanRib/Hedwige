import axios from 'axios';

export async function sendMailWithGraph(accessToken: string, to: string, subject: string, bodyText: string) {
  const mail = {
    message: {
      subject,
      body: { contentType: 'Text', content: bodyText },
      toRecipients: [{ emailAddress: { address: to } }]
    }
  };

  const resp = await axios.post('https://graph.microsoft.com/v1.0/me/sendMail', mail, {
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
  });

  return resp.data;
}
