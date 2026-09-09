const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGO_URL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectDB() {
  if (db) return db;
  await client.connect();
  db = client.db(process.env.DB_NAME || "Sojaru");
  console.log("Connected to MongoDB Atlas:", db.databaseName);
  return db;
}

module.exports = { connectDB, client };
