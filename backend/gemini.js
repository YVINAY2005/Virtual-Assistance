import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.replace(/[`'"]/g, '').trim());

const geminiResponse = async (prompt, assistanceName, userName) => {
    const fullPrompt = `You are ${assistanceName}, a helpful AI assistant created by ${userName}. Your task is to analyze the user's input and respond with a JSON object containing the "type" and required fields. Do not add extra text outside the JSON.

Response Format: Always return valid JSON with "type" and the specified fields for that type. No additional explanations.

Available Types:
- "general": For general conversation, questions, or anything not fitting other types. Include "response" with your reply. Example: {"type": "general", "response": "Hello! How can I help?"}
- "define_word": For word definitions. Include "word" and "definition". Example: {"type": "define_word", "word": "serendipity", "definition": "The occurrence of events by chance in a happy way."}
- "math_calculation": For math problems. Include "expression" and "result". Example: {"type": "math_calculation", "expression": "2 + 3", "result": "The sum of 2 and 3 is 5"}
- "time": For time queries. Just return type "time". Example: {"type": "time"}
- "date": For date queries. Just return type "date". Example: {"type": "date"}
- "weather": For weather queries. Include "location". Example: {"type": "weather", "location": "New York"}
- "news": For news requests. Just return type "news". Example: {"type": "news"}
- "set_alarm": For setting alarms. Include "time" in 24-hour format. Example: {"type": "set_alarm", "time": "14:30"}
- "return": For returning to previous page. Just return type "return". Example: {"type": "return"}
- "shutdown": For PC shutdown requests. Just return type "shutdown". Example: {"type": "shutdown"}
- "joke": For jokes. Include "joke" with the joke. Example: {"type": "joke", "joke": "Why did the scarecrow win an award? Because he was outstanding in his field!"}
- "quote": For quotes. Include "quote" with the quote. Example: {"type": "quote", "quote": "The only way to do great work is to love what you do."}
- "advice": For advice. Include "advice" with the advice. Example: {"type": "advice", "advice": "Set clear goals and prioritize tasks."}
- "google_search": For web searches. Include "query". Example: {"type": "google_search", "query": "latest news on AI"}
- "youtube_search": For YouTube searches. Include "query". Example: {"type": "youtube_search", "query": "React.js tutorials"}
- "open_application": For opening apps. Include "app". Example: {"type": "open_application", "app": "youtube"}
- "web_search": For searches on specific websites. Include "searchType" (e.g., "linkedin", "instagram", "facebook", "twitter") and "query". Example: {"type": "web_search", "searchType": "linkedin", "query": "software engineer"}
- "translate_text": For translating text. Include "text", "from" (source language), "to" (target language), and "translation" (the translated text). Example: {"type": "translate_text", "text": "Hello world", "from": "en", "to": "es", "translation": "Hola mundo"}
- "unknown": For unrecognized inputs. Include "response" with an apology. Example: {"type": "unknown", "response": "Sorry, I cannot understand the request type."}

Instructions:
- Choose the most specific type.
- For "define_word", always provide the definition.
- For "math_calculation", compute and provide the result.
- If unsure, use "general".
- Do not include "response" for command types like "google_search" or "open_application".

User input: ${prompt}`;

    try {
        // Use gemini-flash-latest as it is the most reliable alias for this key
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const responseText = response.text();
        
        console.log("Raw Gemini response:", responseText);
        
        let parsed;
        try {
            parsed = JSON.parse(responseText.trim());
        } catch (e1) {
            const jsonMatch = responseText.match(/{[\s\S]*}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                parsed = { type: "general", response: responseText };
            }
        }
        
        if (!parsed.type) parsed.type = "unknown";
        if (!parsed.response && !["google_search", "youtube_search", "open_application"].includes(parsed.type)) {
            parsed.response = "Response generated but format was incomplete.";
        }
        
        return parsed;
        
    } catch (error) {
        console.error("Gemini SDK Error:", error.message);
        
        // Check for 404/429 and try fallbacks
        if (error.message.includes("404") || error.message.includes("429")) {
            const fallbacks = ["gemini-2.0-flash", "gemini-pro-latest", "gemini-2.5-flash"];
            for (const fallbackModelName of fallbacks) {
                console.log(`Attempting fallback to ${fallbackModelName}...`);
                try {
                    const fallbackModel = genAI.getGenerativeModel({ model: fallbackModelName });
                    const result = await fallbackModel.generateContent(fullPrompt);
                    const response = await result.response;
                    const responseText = response.text();
                    const jsonMatch = responseText.match(/{[\s\S]*}/);
                    return jsonMatch ? JSON.parse(jsonMatch[0]) : { type: "general", response: responseText };
                } catch (fallbackError) {
                    console.error(`Fallback to ${fallbackModelName} failed:`, fallbackError.message);
                }
            }
        }

        return {
            type: "unknown",
            response: "I apologize, but I encountered an error while processing your request. Please check your API key and connection."
        };
    }
}

export default geminiResponse;
