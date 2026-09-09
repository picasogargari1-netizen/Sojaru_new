const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGO_URL;

if (!uri) {
  throw new Error("MONGO_URL environment variable is not set");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Hostinger-friendly timeout settings
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
});

let db;

async function connectDB() {
  if (db) return db;
  try {
    await client.connect();
    db = client.db(process.env.DB_NAME || "Sojaru");
    console.log("✓ Connected to MongoDB Atlas:", db.databaseName);
    return db;
  } catch (err) {
    console.error("✗ MongoDB connection failed:", err.message);
    console.error("  Check: 1) MONGO_URL is correct  2) Your server IP is whitelisted in Atlas Network Access");
    throw err;
  }
}

async function closeDB() {
  await client.close();
  db = null;
}

module.exports = { connectDB, closeDB, client };
