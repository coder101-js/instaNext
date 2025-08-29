
import { MongoClient, Db } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env');
}

let cachedClient: MongoClient | null = null;

async function connectToClient(): Promise<MongoClient> {
    if (cachedClient) {
        return cachedClient;
    }
    const client = await MongoClient.connect(MONGO_URI);
    cachedClient = client;
    return client;
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

    