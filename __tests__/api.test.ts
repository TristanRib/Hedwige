import request from 'supertest';

jest.mock('../mailer');
jest.mock('../imapClient');

import mailer from '../mailer';
import imapClient from '../imapClient';
import app from '../server';

describe('API endpoints', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('POST /api/send returns ok when mailer resolves', async () => {
    (mailer as any).sendMail.mockResolvedValue({ accepted: ['a@b.c'], messageId: '12345' });
    const res = await request(app)
      .post('/api/send')
      .send({ to: 'a@b.c', subject: 'hi', text: 'hello' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect((mailer as any).sendMail).toHaveBeenCalled();
  });

  test('GET /api/messages returns messages when imapClient resolves', async () => {
    const sample = [{ subject: 's', from: 'me', date: new Date().toISOString(), text: 't' }];
    (imapClient as any).fetchRecent.mockResolvedValue(sample);
    const res = await request(app).get('/api/messages');
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.messages).toEqual(sample);
  });
});
