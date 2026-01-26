const {GoogleGenerativeAI} = require("@google/generative-ai");
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
const MODELS_TO_TEST = [
    "gemini-1.5-flash-latest",
    "gemini-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-flash-001",
    "gemini-pro",
    "gemini-1.0-pro"
];

async function verifyModel() {
    if (! API_KEY) {
        console.error("GEMINI_API_KEY not found");
        return;
    }

    let output = "";
    const log = (msg) => {
        console.log(msg);
        output += msg + "\n";
    };

    console.log("Using API Key:", API_KEY.substring(0, 5) + "...");
    const genAI = new GoogleGenerativeAI(API_KEY);

    for (const modelName of MODELS_TO_TEST) {
        log(`\nTesting model: ${modelName} --------------------------------`);
        try {
            const model = genAI.getGenerativeModel({model: modelName});
            const result = await model.generateContent("Test");
            const response = await result.response;
            log(`✅ SUCCESS with ${modelName}!`);
            log("Response: " + response.text());
        } catch (error) {
            log(`❌ FAILED with ${modelName}`);
            log(`Error: ${
                error.message
            }`);
        }
    }
    fs.writeFileSync(path.resolve(__dirname, "verification_results.txt"), output);
}

verifyModel();
