
import axios from "axios"
const geminiResponse=async(prompt, assistanceName, userName)=>{

    try {
        const apiUrl=process.env.GEMINI_API_URL
        const fullPrompt=`You are ${assistanceName}, a helpful AI assistant created by ${userName}. Your task is to analyze the user's input and respond with a JSON object containing the "type" and required fields. Do not add extra text outside the JSON.

Response Format: Always return valid JSON with "type" and the specified fields for that type. No additional explanations.

Available Types:
- "general": For general conversation, questions, or anything not fitting other types. Include "response" with your reply. Example: {"type": "general", "response": "Hello! How can I help?"} Example: {"type": "general", "response": "My name is ${assistanceName} and I was created by ${userName}."} Example: {"type": "general", "response": "I was created by ${userName}."}
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

User input: ${prompt}`


        if (!apiUrl) {
            throw new Error("GEMINI_API_URL environment variable is not set");
        }

        const result = await axios.post(apiUrl, {
            "contents": [
                {
                    "parts": [
                        {
                            "text": fullPrompt
                        }
                    ]
                }
            ]
        });

        if (!result.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error("Invalid response structure from Gemini API");
        }

        const responseText = result.data.candidates[0].content.parts[0].text;
        console.log("Raw Gemini response:", responseText);
        
        // Improved JSON parsing with fallbacks
        let parsed;
        try {
            // First attempt: direct JSON parse
            parsed = JSON.parse(responseText.trim())
        } catch (e1) {
            console.log("Direct JSON parse failed, attempting to extract JSON from text")
            try {
                // Second attempt: extract JSON from text
                const jsonMatch = responseText.match(/{[\s\S]*}/)
                if (jsonMatch) {
                    parsed = JSON.parse(jsonMatch[0])
                } else {
                    throw new Error("No JSON object found in response")
                }
            } catch (e2) {
                console.log("JSON extraction failed, using fallback response")
                parsed = {
                    type: "unknown",
                    response: "Sorry, I couldn't understand that command."
                }
            }
        }
        
        // Ensure required fields exist
        if (!parsed.type) {
            parsed.type = "unknown"
        }
        if (!parsed.response && !["google_search", "youtube_search", "open_application"].includes(parsed.type)) {
            parsed.response = "I understood your command but couldn't generate a proper response."
        }
        
        console.log("Parsed response:", parsed)
        return parsed
        
    } catch (error) {
        console.error("Error in Gemini response:", error);
        if (error.response) {
            console.error("Gemini API response error:", error.response.status, error.response.data);
        }
        console.error("Gemini API error:", error.message);
        return {
            type: "unknown",
            response: "I apologize, but I encountered an error while processing your request. Please try again."
        };
    }
}
export default geminiResponse
