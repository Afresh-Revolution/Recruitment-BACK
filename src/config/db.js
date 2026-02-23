import mongoose from "mongoose";

export async function connectDb(uri) {
  try {
    if (!uri) {
      console.error("❌ MongoDB URI is missing! Please check your .env file.");
      process.exit(1);
    }

    console.log("\n🔄 Connecting to MongoDB Atlas...");
    console.log(`📝 Connection URI: ${uri.replace(/:[^:@]+@/, ":****@")}`);
    
    // Set connection options for better error handling
    const connectionOptions = {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout (increased)
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: "majority"
    };
    
    console.log("⏳ Attempting connection (this may take 10-30 seconds)...");
    await mongoose.connect(uri, connectionOptions);
    
    // Get connection info
    const db = mongoose.connection;
    const dbName = db.name;
    
    // Success message with clear formatting
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ MongoDB connected successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📊 Database: ${dbName}`);
    console.log(`🌐 Host: MongoDB Atlas`);
    console.log(`🔗 Connection State: ${db.readyState === 1 ? "Connected" : "Disconnected"}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    // Set up connection event listeners
    db.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });
    
    db.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected. Attempting to reconnect...");
    });
    
    db.on("reconnected", () => {
      console.log("\n✅ MongoDB reconnected successfully!\n");
    });
    
  } catch (error) {
    console.error("\n❌ MongoDB Connection Failed!");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const errorMsg = error.message.toLowerCase();
    
    if (errorMsg.includes("whitelist") || errorMsg.includes("ip") || errorMsg.includes("replicasetnoprimary")) {
      console.error("🔒 CONNECTION BLOCKED - Troubleshooting Steps:");
      console.error("\n1️⃣  VERIFY IP WHITELIST STATUS:");
      console.error("   • Go to: https://cloud.mongodb.com");
      console.error("   • Click 'Network Access' (left sidebar)");
      console.error("   • Look for '0.0.0.0/0' OR your specific IP address");
      console.error("   • Status MUST show 'Active' (green checkmark)");
      console.error("   • If status shows 'Pending', wait 2-5 minutes");
      console.error("\n2️⃣  IF IP IS NOT LISTED OR NOT ACTIVE:");
      console.error("   • Click 'Add IP Address'");
      console.error("   • Enter: 0.0.0.0/0");
      console.error("   • Add comment: 'Development - Allow all'");
      console.error("   • Click 'Confirm'");
      console.error("   • Wait 3-5 minutes for status to change to 'Active'");
      console.error("\n3️⃣  VERIFY CORRECT PROJECT & CLUSTER:");
      console.error("   • Make sure you're in the CORRECT MongoDB Atlas project");
      console.error("   • Check cluster name matches: cluster0.lhu7t2c.mongodb.net");
      console.error("   • Network Access applies to ALL clusters in the project");
      console.error("\n4️⃣  CHECK DATABASE USER PERMISSIONS:");
      console.error("   • Go to 'Database Access' (left sidebar)");
      console.error("   • Find user: abnerabraham51_db_user");
      console.error("   • Make sure password is: 102239abnerr");
      console.error("   • User should have 'Atlas admin' or 'Read and write' permissions");
      console.error("\n5️⃣  WAIT AND RETRY:");
      console.error("   • After adding IP, wait 3-5 minutes");
      console.error("   • Refresh MongoDB Atlas page to verify 'Active' status");
      console.error("   • Then restart server: npm run dev");
      console.error("\n💡 QUICK TEST:");
      console.error("   • Use 0.0.0.0/0 (allows all IPs) to eliminate IP detection issues");
      console.error("   • This is safe for development/testing");
    } else if (errorMsg.includes("authentication") || errorMsg.includes("bad auth")) {
      console.error("🔐 AUTHENTICATION FAILED");
      console.error("\n   Verify your credentials:");
      console.error("   • Username: abnerabraham51_db_user");
      console.error("   • Password: 102239abnerr");
      console.error("\n   Check in MongoDB Atlas:");
      console.error("   • Go to 'Database Access'");
      console.error("   • Find your user and verify password");
      console.error("   • Reset password if needed");
    } else {
      console.error("❌ Error Details:");
      console.error(`   ${error.message}`);
      console.error("\n💡 Other Possible Issues:");
      console.error("   • MongoDB Atlas cluster might be paused");
      console.error("   • Network/firewall blocking connection");
      console.error("   • Connection string format issue");
    }
    
    console.error("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("📝 Connection String Used:");
    console.error(`   ${uri.replace(/:[^:@]+@/, ":****@")}`);
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    throw error; // Re-throw to let server.js handle it
  }
}

