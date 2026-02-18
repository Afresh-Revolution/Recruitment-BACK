import "dotenv/config";

import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";
import { verifySmtpConnection } from "./utils/email.js";

const PORT = Number(process.env.PORT || 5000);

// Check if MONGODB_URI is loaded
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in environment variables!");
  console.error("Local: create a .env file with MONGODB_URI.");
  console.error("Render: add MONGODB_URI in Dashboard → Your Service → Environment.");
  process.exit(1);
}

// Connect to database first
try {
  await connectDb(process.env.MONGODB_URI);
  // Verify SMTP connection
  await verifySmtpConnection();
} catch (error) {
  console.error("\n💥 Server cannot start without database connection.");
  console.error("Please fix the MongoDB connection issue above and try again.\n");
  process.exit(1);
}

// Create and start the Express app
const app = createApp();

app.listen(PORT, () => {
  console.log(`🚀 Server started successfully!`);
  console.log(`🌐 API listening on ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}\n`);
});


