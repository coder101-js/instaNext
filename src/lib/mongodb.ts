

import { MongoClient, Db } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || "mongodb://root:root@34.132.222.126:27017/";

let cachedClient: MongoClient | null = null;
let cachedDb: { [key: string]: Db } = {};

async function connectToClient(): Promise<MongoClient> {
    if (cachedClient) {
        return cachedClient;
    }
    const client = await MongoClient.connect(MONGO_URI);
    cachedClient = client;
    return client;
}

async function connectToDatabase(dbName: string): Promise<Db> {
    if (cachedDb[dbName]) {
        return cachedDb[dbName];
    }
    const client = await connectToClient();
    const db = client.db(dbName);
    cachedDb[dbName] = db;
    return db;
}

export async function connectToAuthDatabase(): Promise<Db> {
  return connectToDatabase('instanext-auth');
}

export async function connectToFeedDatabase(): Promise<Db> {
  return connectToDatabase('instanext-feed');
}

export async function connectToUsersDatabase(): Promise<Db> {
    return connectToDatabase('instanext-users');
}
