const fs = require('fs');
const path = require("path");

// Manually read .env
const envPath = path.resolve(__dirname, "../.env");
const envContent = fs.readFileSync(envPath, 'utf8');
const envConfig = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        if (key && ! key.startsWith('#')) {
            envConfig[key] = value;
        }
    }
});

const API_KEY = envConfig.GEMINI_API_KEY;

async function listModels() {
    if (! API_KEY) {
        console.error("GEMINI_API_KEY not found");
        return;
    }

    console.log("Fetching models...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        fs.writeFileSync(path.resolve(__dirname, "../models.json"), JSON.stringify(data, null, 2));
        console.log("Models saved to models.json");

    } catch (error) {
        console.error("Request failed:", error);
    }
}

listModels();
