
import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env');
}

let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
    if (cachedClient) {
        return cachedClient;
    }
    const client = await MongoClient.connect(MONGO_URI);
    cachedClient = client;
    return client;
}

export async function connectToAuthDatabase() {
  const client = await connectToDatabase();
  return client.db('auth');
}

export async function connectToFeedDatabase() {
  const client = await connectToDatabase();
  return client.db('feed');
}

export async function connectToUsersDatabase() {
    const client = await connectToDatabase();
    return client.db('users');
}

export async function connectToMessagesDatabase() {
    const client = await connectToDatabase();
    return client.db('messages');
}
