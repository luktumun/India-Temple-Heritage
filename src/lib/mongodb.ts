import mongoose from "mongoose";

function getMongoUri(): string {
  const value = process.env.MONGODB_URI;
  if (!value) throw new Error("MONGODB_URI is not configured. Add it to .env.local before starting the app.");
  return value;
}
const uri = getMongoUri();

type MongooseCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cache = global.mongooseCache ?? { connection: null, promise: null };
global.mongooseCache = cache;

export async function connectToDatabase() {
  if (cache.connection) return cache.connection;

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, { bufferCommands: false });
  }

  try {
    cache.connection = await cache.promise;
    return cache.connection;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
}
