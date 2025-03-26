import { createRequire } from "module";
const require = createRequire(import.meta.url);

const DEBUG = false;


// Gemini setup
const API_KEY = "API_KEY_HERE";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

async function getGeminiResponse(prompt) {
    """Sends a prompt to Gemini and returns the response."""
    try {
        const response = await fetch(`${BASE_URL}/models/gemini-1.5-pro-latest:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });
        const data = await response.json();
        return data.text || "No response received.";
    } catch (error) {
        return `An error occurred: ${error.message}`;
    }
}

async function listModels() {
    const url = `${BASE_URL}/models?key=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (response.ok) {
            return await response.json();
        } else {
            console.error(`Error: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error("Failed to fetch models: ", error);
    }
}

async function generate_ai_subtask(TASK_NAME) {
        let userInput = "Please generate a sensible number of subtasks, less than or equal to 10, for the main task: " + TASK_NAME;
        
        if (DEBUG) {
            console.log(userInput);
            const models = await listModels();
            if (models) {
                models.models.forEach(model => {
                    console.log(`Model ID: ${model.name}`);
                    console.log(`Supported methods: ${model.supportedGenerationMethods}`);
                });
            }
        }
        
        if (TASK_NAME.toLowerCase() === "exit") {
            process.exit();
        }
        
        const aiResponse = await getGeminiResponse(userInput);
        console.log(aiResponse);
        rl.close();
    });
}

