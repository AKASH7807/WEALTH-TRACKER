const {GoogleGenerativeAI} = require("@google/generative-ai");
const fs = require('fs');
const path = require("path");

// Manually read .env since dotenv might not be installed
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
    try {
        if (! API_KEY) {
            console.error("GEMINI_API_KEY not found in .env");
            return;
        }
        console.log("Using API Key:", API_KEY.substring(0, 5) + "...");

        const genAI = new GoogleGenerativeAI(API_KEY);

        const modelsToTry = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro",
            "gemini-pro",
            "gemini-1.0-pro"
        ];

        for (const modelName of modelsToTry) {
            console.log(`\nTesting model: ${modelName}`);
            try {
                const model = genAI.getGenerativeModel({model: modelName});
                const result = await model.generateContent("Hello");
                const response = await result.response;
                console.log(`SUCCESS: ${modelName} works! Response:`, response.text());
            } catch (error) {
                console.error(`FAILED: ${modelName}. Error:`, error.message);
            }
        }

    } catch (error) {
        console.error("Script error:", error);
    }
}

listModels();
