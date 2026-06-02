import mongoose from 'mongoose';
import { configureMongoDns } from '@/lib/mongoDns';

function getConnectionUris() {
  const uris = [];
  if (process.env.MONGODB_URI) uris.push(process.env.MONGODB_URI);
  if (
    process.env.MONGODB_URI_DIRECT &&
    !uris.includes(process.env.MONGODB_URI_DIRECT)
  ) {
    uris.push(process.env.MONGODB_URI_DIRECT);
  }
  return uris;
}

configureMongoDns(process.env.MONGODB_URI);

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectWithRetry() {
  const uris = getConnectionUris();
  if (!uris.length) {
    throw new Error('Please define MONGODB_URI (or MONGODB_URI_DIRECT) in .env');
  }

  const opts = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 20000,
  };

  let lastError;
  for (const uri of uris) {
    configureMongoDns(process.env.MONGODB_URI || uri);

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        if (mongoose.connection.readyState !== 0) {
          await mongoose.disconnect();
        }
        return await mongoose.connect(uri, opts);
      } catch (error) {
        lastError = error;
        if (attempt < 2) {
          console.warn(`MongoDB (${uri.includes('srv') ? 'SRV' : 'direct'}) attempt ${attempt}/2: ${error.message}`);
          await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
        }
      }
    }
  }

  throw lastError;
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = connectWithRetry();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection failed:', e.message);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
