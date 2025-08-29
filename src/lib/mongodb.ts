
import { MongoClient, Db } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase(): Promise<Db> {
    if (cachedClient && cachedDb) {
        return cachedDb;
    }
    const client = await MongoClient.connect(MONGO_URI);
    const db = client.db(); // This will use the default database from the connection string

    cachedClient = client;
    cachedDb = db;

    return db;
}

export async function connectToAuthDatabase(): Promise<Db> {
  return connectToDatabase();
}

export async function connectToFeedDatabase(): Promise<Db> {
  return connectToDatabase();
}

export async function connectToUsersDatabase(): Promise<Db> {
    return connectToDatabase();
}

export async function connectToMessagesDatabase(): Promise<Db> {
    return connectToDatabase();
}
