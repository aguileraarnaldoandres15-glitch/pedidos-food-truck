import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Base de datos aislada en memoria para los tests de integración.
let memoryServer;

export async function connectMemoryDb() {
  // El primer arranque de mongod (por ejemplo, en Windows) puede superar los 10 s que trae por defecto.
  memoryServer = await MongoMemoryServer.create({ instance: { launchTimeout: 60_000 } });
  await mongoose.connect(memoryServer.getUri());
}

export async function clearMemoryDb() {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

export async function disconnectMemoryDb() {
  await mongoose.disconnect();

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = undefined;
  }
}
