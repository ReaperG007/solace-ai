const path = require("node:path");
const dotenv = require("dotenv");

// Load frontend/.env explicitly so each workspace uses its own .env file
dotenv.config({ path: path.resolve(__dirname, ".env") });

const apiUrl =
  process.env.VITE_API_URL ||
  process.env.EXPO_PUBLIC_API_URL ||
  "http://localhost:4000";

module.exports = {
  expo: {
    name: process.env.EXPO_PUBLIC_APP_NAME || "Solace AI",
    slug: "solace-ai",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    splash: {
      backgroundColor: "#F4F6F8",
    },
    extra: {
      apiUrl,
      appName: process.env.EXPO_PUBLIC_APP_NAME || "Solace AI",
      apiTimeoutMs: Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS || 20000),
    },
  },
};
