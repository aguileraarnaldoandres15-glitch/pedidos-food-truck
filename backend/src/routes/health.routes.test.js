import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('GET /api/health', () => {
  it('responde 200 con status ok y db disconnected cuando no hay conexión a MongoDB', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toEqual({
      data: { status: 'ok', db: 'disconnected' },
    });
  });
});
