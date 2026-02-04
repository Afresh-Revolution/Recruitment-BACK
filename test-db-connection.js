import "dotenv/config";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in environment variables!");
  console.error("Please check your .env file.");
  process.exit(1);
}

console.log("🔄 Testing MongoDB connection...");
console.log(`📝 Connection string: ${MONGODB_URI.replace(/:[^:@]+@/, ":****@")}`); // Hide password

async function testConnection() {
  try {
    const connectionOptions = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };
    
    await mongoose.connect(MONGODB_URI, connectionOptions);
    
    const db = mongoose.connection;
    const dbName = db.name;
    
    console.log("\n✅ MongoDB connected successfully!");
    console.log(`📊 Database: ${dbName}`);
    console.log(`🌐 Host: MongoDB Atlas`);
    console.log(`🔗 Connection State: ${db.readyState === 1 ? "Connected" : "Disconnected"}`);
    
    // Test a simple operation
    const collections = await db.db.listCollections().toArray();
    console.log(`\n📁 Collections found: ${collections.length}`);
    if (collections.length > 0) {
      console.log(`   Collections: ${collections.map(c => c.name).join(", ")}`);
    } else {
      console.log("   (No collections yet - database is empty)");
    }
    
    await mongoose.disconnect();
    console.log("\n✅ Connection test completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ MongoDB Connection Failed!");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    if (error.message.includes("whitelist") || error.message.includes("IP")) {
      console.error("🔒 IP ADDRESS NOT WHITELISTED");
      console.error("\n📋 To fix this:");
      console.error("   1. Go to: https://cloud.mongodb.com");
      console.error("   2. Navigate to Network Access");
      console.error("   3. Click 'Add IP Address'");
      console.error("   4. Click 'Add Current IP Address' or use 0.0.0.0/0");
      console.error("   5. Wait 1-2 minutes, then restart server");
    } else if (error.message.includes("authentication")) {
      console.error("🔐 AUTHENTICATION FAILED");
      console.error("   Check your username and password");
    } else {
      console.error("❌ Error:", error.message);
    }
    
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    process.exit(1);
  }
}

testConnection();
