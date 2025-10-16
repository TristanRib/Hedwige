import request from 'supertest';

jest.mock('../mailer');
jest.mock('../imapClient');

import mailer from '../mailer';
import imapClient from '../imapClient';
import app from '../server';

describe('API error handling and static', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('POST /api/send returns 500 when mailer rejects', async () => {
    (mailer as any).sendMail.mockRejectedValue(new Error('send fail'));
    const res = await request(app)
      .post('/api/send')
      .send({ to: 'a@b.c', subject: 'hi', text: 'hello' });
    expect(res.statusCode).toBe(500);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toMatch(/send fail/);
  });

  test('GET /api/messages returns 500 when imapClient throws', async () => {
    (imapClient as any).fetchRecent.mockRejectedValue(new Error('imap fail'));
    const res = await request(app).get('/api/messages');
    expect(res.statusCode).toBe(500);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toMatch(/imap fail/);
  });

  test('GET / serves the frontend index', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Hedwige Mail App/);
  });
});
