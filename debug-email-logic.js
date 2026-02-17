import mongoose from "mongoose";
import "dotenv/config";
import { sendApplicationStatusEmail } from "./src/utils/email.js";
import { FormData } from "./src/models/FormData.js";
import { connectDb } from "./src/config/db.js";

// Mock Data for Simulation
const MOCK_APPLICATION = {
    _id: "mock-app-id",
    data: {
        email: "abnerabraham25@gmail.com", // Valid email
        fullName: "Test Candidate"
    },
    companyId: { name: "Test Company" },
    roleId: { title: "Test Role" }
};

const STATUS = "approved"; // or "rejected"
const MESSAGE = "Congratulations on moving forward!";

async function simulateStatusUpdate() {
    console.log("--- Starting Simulation ---");

    // 1. Validate Input similar to controller
    const rawEmail = MOCK_APPLICATION.data?.email;
    const applicantEmail = typeof rawEmail === "string" ? rawEmail.trim() : "";
    const hasValidEmail = applicantEmail.length > 0 && applicantEmail.includes("@");

    console.log(`Email from data: '${rawEmail}'`);
    console.log(`Parsed email: '${applicantEmail}'`);
    console.log(`Has valid email? ${hasValidEmail}`);

    const isApproved = STATUS === "approved" || STATUS === "hired";
    const isRejected = STATUS === "rejected";
    const shouldSendEmail = hasValidEmail && (isApproved || isRejected);

    console.log(`Status: ${STATUS}`);
    console.log(`Should send email? ${shouldSendEmail}`);

    if (shouldSendEmail) {
        console.log(`Attempting to send email to ${applicantEmail}...`);
        try {
            const result = await sendApplicationStatusEmail(
                applicantEmail,
                MOCK_APPLICATION.data.fullName,
                MOCK_APPLICATION.companyId.name,
                MOCK_APPLICATION.roleId.title,
                STATUS,
                MESSAGE
            );
            console.log("Email Result:", result);
        } catch (error) {
            console.error("Email simulated send failed:", error);
        }
    } else {
        console.log("Skipping email logic.");
    }
    console.log("--- End Simulation ---");
}

simulateStatusUpdate();
