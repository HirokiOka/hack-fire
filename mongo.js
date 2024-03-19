const { MongoClient } = require('mongodb');
require('dotenv').config();

const URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;
const DB_COLLECTION = process.env.DB_COLLECTION;


const client = new MongoClient(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function sendData(data) {
  try {
    await client.connect();
    const database = client.db(DB_NAME);
    const col = database.collection(DB_COLLECTION);
    const result = await col.insertOne(data);
    return result;
  } finally {
    await client.close();
  }
}

export default sendData;
