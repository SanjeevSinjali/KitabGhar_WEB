import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer | null = null;

/**
 * Spins up an in-memory MongoDB instance and connects mongoose to it.
 * NOTE: on first run this downloads a `mongod` binary, which requires
 * network access. If that's not available in your environment, set
 * MONGOMS_DISABLE_POSTINSTALL=1 and point MONGO_URI to a real/local
 * MongoDB instance instead, or run `npx mongodb-memory-server-test`
 * once with network access to prime the binary cache.
 */
export async function connectTestDB(): Promise<void> {
  if (process.env.MONGO_URI) {
    await mongoose.connect(process.env.MONGO_URI);
    return;
  }

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}

/** Deletes all documents from every collection between tests. */
export async function clearTestDB(): Promise<void> {
  const { collections } = mongoose.connection;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({}))
  );
}

/** Disconnects mongoose and stops the in-memory server. */
export async function disconnectTestDB(): Promise<void> {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
}