const { MongoClient } = require('mongodb');
const url = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);

module.exports = async function connectToDatabase() {
  await client.connect();
  console.log('Connected to MongoDB: dbRestaurants');
  return client.db('dbRestaurants');
};
