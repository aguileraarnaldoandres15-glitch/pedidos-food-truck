import mongoose from 'mongoose';

const CONNECTED = 1;

export function getHealthStatus() {
  const db = mongoose.connection.readyState === CONNECTED ? 'connected' : 'disconnected';
  return { status: 'ok', db };
}
