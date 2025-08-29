
import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI;
const MONGO_URI_FEED1 = process.env.MONGO_URI_FEED1;
const MONGO_URI_USERS1 = process.env.MONGO_URI_USERS1;
const MONGO_URI_MESSAGES1 = process.env.MONGO_URI_MESSAGES1;


if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env');
}
if (!MONGO_URI_FEED1) {
  throw new Error('Please define the MONGO_URI_FEED1 environment variable inside .env');
}
if (!MONGO_URI_USERS1) {
    throw new Error('Please define the MONGO_URI_USERS1 environment variable inside .env');
}
if (!MONGO_URI_MESSAGES1) {
    throw new Error('Please define the MONGO_URI_MESSAGES1 environment variable inside .env');
}


let cachedAuthDb: MongoClient | null = null;
let cachedFeedDb: MongoClient | null = null;
let cachedUsersDb: MongoClient | null = null;
let cachedMessagesDb: MongoClient | null = null;


export async function connectToAuthDatabase() {
  if (cachedAuthDb) {
    return cachedAuthDb.db('auth');
  }
  const client = await MongoClient.connect(MONGO_URI!);
  cachedAuthDb = client;
  return client.db('auth');
}

export async function connectToFeedDatabase() {
  if (cachedFeedDb) {
    return cachedFeedDb.db('feed');
  }
  const client = await MongoClient.connect(MONGO_URI_FEED1!);
  cachedFeedDb = client;
  return client.db('feed');
}

export async function connectToUsersDatabase() {
    if (cachedUsersDb) {
        return cachedUsersDb.db('users');
    }
    const client = await MongoClient.connect(MONGO_URI_USERS1!);
    cachedUsersDb = client;
    return client.db('users');
}

export async function connectToMessagesDatabase() {
    if (cachedMessagesDb) {
        return cachedMessagesDb.db('messages');
    }
    const client = await MongoClient.connect(MONGO_URI_MESSAGES1!);
    cachedMessagesDb = client;
    return client.db('messages');
}
