

import { MongoClient, Db } from 'mongodb';

// This file is currently not used because data fetching is mocked.
// When you are ready to connect to a real database, you will need to
// provide a valid MONGO_URI and uncomment the connection logic.

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";

let cachedClient: MongoClient | null = null;

async function connectToClient(): Promise<MongoClient> {
    if (cachedClient) {
        return cachedClient;
    }
    // Since data is mocked, we prevent actual connection attempts.
    // To connect to a real database, uncomment the following lines
    // and ensure your MONGO_URI is correct.
    // const client = await MongoClient.connect(MONGO_URI);
    // cachedClient = client;
    // return client;
    throw new Error("Database connection is disabled because data is mocked.");
}

export async function connectToAuthDatabase(): Promise<Db> {
  const client = await connectToClient();
  return client.db('instanext-auth');
}

export async function connectToFeedDatabase(): Promise<Db> {
  const client = await connectToClient();
  return client.db('instanext-feed');
}

export async function connectToUsersDatabase(): Promise<Db> {
    const client = await connectToClient();
    return client.db('instanext-users');
}
