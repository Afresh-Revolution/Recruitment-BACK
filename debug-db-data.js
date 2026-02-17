import mongoose from "mongoose";
import "dotenv/config";
import { FormData } from "./src/models/FormData.js";
import { connectDb } from "./src/config/db.js";

async function inspectFormData() {
    console.log("--- Inspecting FormData Documents ---");

    if (!process.env.MONGODB_URI) {
        console.error("❌ MONGODB_URI not found.");
        process.exit(1);
    }

    try {
        await connectDb(process.env.MONGODB_URI);

        const applications = await FormData.find().sort({ createdAt: -1 }).limit(5).lean();

        console.log(`Found ${applications.length} applications.`);

        applications.forEach((app, index) => {
            console.log(`\n[Application #${index + 1}] ID: ${app._id}`);
            console.log("Status:", app.status);
            console.log("Data Field Structure:", JSON.stringify(app.data, null, 2));

            // Simulation check
            const rawEmail = app.data?.email;
            const applicantEmail = typeof rawEmail === "string" ? rawEmail.trim() : "";
            const hasValidEmail = applicantEmail.length > 0 && applicantEmail.includes("@");

            console.log(`> Would send email? ${hasValidEmail ? "YES" : "NO"} (Email: '${applicantEmail}')`);
        });

    } catch (error) {
        console.error("Error inspecting DB:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\n--- Done ---");
    }
}

inspectFormData();
