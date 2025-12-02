import geminiResponse from "../gemini.js";
import User from "../models/user.model.js";
import moment from "moment/moment.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import { exec } from "child_process"; // Added for shutdown

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("getCurrentUser error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const UpdateAssistant = async (req, res) => {
  try {
    const { assistanceName, imageUrl } = req.body;
    let assistanceImage;
    if (req.file) {
      assistanceImage = await uploadOnCloudinary(req.file.path);
    } else {
      assistanceImage = imageUrl;
    }
    const user = await User.findByIdAndUpdate(
      req.userId,
      { assistanceName, assistanceImage },
      { new: true }
    ).select("-password");
    res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;
    const user = await User.findById(req.userId);
    user.history.push(command);
    await user.save();
    const assistanceName = user.assistanceName;
    const userName = user.name;
    
    console.log("Asking Gemini with:", { command, assistanceName, userName });
    const result = await geminiResponse(command, assistanceName, userName);
    console.log("Gemini result:", result);
    
    if (!result || !result.type) {
      console.error("Invalid response format:", result);
      return res.status(400).json({ type: "unknown", response: "Invalid response format from assistant" });
    }

    const type = result.type;

    switch (type) {
      case "date":
        return res.json({
          type,
          command,
          response: `The current date is ${moment().format("MMMM Do YYYY")}`,
        });
      case "time":
        return res.json({
          type,
          command,
          response: `The current time is ${moment().format("hh:mm A")}`,
        });
      case "day":
        return res.json({
          type,
          command,
          response: `Today is ${moment().format("dddd")}`,
        });
      case "month":
        return res.json({
          type,
          command,
          response: `The current month is ${moment().format("MMMM")}`,
        });
      case "year":
        return res.json({
          type,
          command,
          response: `The current year is ${moment().format("YYYY")}`,
        });
      case "math_calculation":
        return res.json({
          type,
          command,
          result: result.result,
        });
      case "define_word":
        return res.json({
          type,
          command,
          definition: result.definition || "Here's the definition!",
        });
      case "web_search":
        return res.json({
          type,
          searchType: result.searchType,
          query: result.query,
          response: `Searching ${result.searchType} for your query...`,
        });
      case "google_search":
        return res.json({
          type,
          query: result.query,
          response: "Searching Google for your query...",
        });
      case "youtube_search":
        return res.json({
          type,
          query: result.query,
          response: "Searching YouTube for your query...",
        });
      case "wikipedia_search":
        return res.json({
          type,
          query: result.query,
          response: "Searching Wikipedia for your query...",
        });
      case "news_search":
        return res.json({
          type,
          query: result.query,
          response: "Searching for the latest news...",
        });
      case "joke":
        return res.json({
          type,
          joke: result.joke || "Here's a joke for you!",
        });
      case "quote":
        return res.json({
          type,
          quote: result.quote || "Here's an inspirational quote!",
        });
      case "advice":
        return res.json({
          type,
          advice: result.advice || "Here's some advice!",
        });
      case "weather":
        return res.json({
          type,
          location: result.location,
          response: "Getting weather information...",
        });
      case "open_application":
        return res.json({
          type: "open_application",
          app: result.app,
          query: result.query || null,
          response: `Opening ${result.app || "application"}...`,
        });
      case "general":
        return res.json({
          type: "general",
          response: result.response || "How can I help you?",
        });
      case "return":
        return res.json({
          type: "return",
          response: "Returning to the previous page...",
        });
      case "shutdown": // Shutdown confirmation request
        return res.json({
          type: "shutdown_confirm",
          response: "Are you sure you want to shut down your computer?",
        });
      case "return": // New return support
        return res.json({
          type: "return",
          response: "Returning to the home page...",
        });
      case "unknown":
      default:
        return res.json({
          type: "unknown",
          response: result.response || "Sorry, I cannot understand the request type.",
        });
    }
  } catch (error) {
    console.error("askToAssistant error:", error);
    return res.status(500).json({
      type: "error",
      response: "Sorry I cannot process your request at the moment"
    });
  }
};

export const confirmShutdown = async (req, res) => {
  try {
    // Execute shutdown command
    exec("shutdown /s /t 0", (err) => {
      if (err) {
        console.error("Shutdown failed:", err);
        return res.status(500).json({ message: "Failed to shutdown" });
      }
    });
    return res.json({
      type: "shutdown",
      response: "Shutting down your computer...",
    });
  } catch (error) {
    return res.status(500).json({ response: "Sorry I cannot process your request at the moment" });
  }
};
