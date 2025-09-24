import geminiResponse from "../gemini.js";
import User from "../models/user.model.js";
import moment from "moment/moment.js";
import uploadOnCloudinary from "../config/cloudinary.js";

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

export const UpdateAssistant=async(req,res)=>{
  try {
    const {assistanceName,imageUrl}=req.body
    let assistanceImage;
    if(req.file){
      assistanceImage=await uploadOnCloudinary(req.file.path)
    }
    else{
      assistanceImage=imageUrl
    }
    const user=await User.findByIdAndUpdate(req.userId,{assistanceName,assistanceImage},{new:true}).select("-password")
    res.status(200).json(user)
  } catch (error) {
    return res.status(500).json({ message: "Server error" });

  }
}

export const askToAssistant=async(req,res)=>{
  try {
    const{command}=req.body
    const user=await User.findById(req.userId);
    user.history.push(command)
    user.save()
    const userName=user.assistanceName
    const assistanceName=user.name
    const result = await geminiResponse(command, userName, assistanceName);
    if (!result || !result.type) {
      return res.status(400).json({ message: "Invalid response format from assistant" });
    }
    return res.status(200).json(result);

    console.log("Gemini result:", result);

    const type=result.type;

    switch(type){
      case 'date':
        return res.json({
          type,
          command,
          response:`The current date is ${moment().format("MMMM Do YYYY")}`
        });
      case 'time':
        return res.json({
          type,
          command,
          response:`The current time is ${moment().format("hh:mm A")}`
        });
      case 'day':
        return res.json({
          type,
          command,
          response:`Today is ${moment().format("dddd")}`
        });
      case 'month':
        return res.json({
          type,
          command,
          response:`The current month is ${moment().format("MMMM")}`
        });
      case 'year':
        return res.json({
          type,
          command,
          response:`The current year is ${moment().format("YYYY")}`
        });
        case 'math_calculation':
          return res.json({
            type,
            command,
            result: gemResult.result,  // Gemini should give you this
          });
        case 'define_word':
          return res.json({
            type,
            command,
            definition: gemResult.definition || "Here's the definition!"
          });

      case 'google_search':
        return res.json({
          type,
          query: gemResult.query,
          response: "Searching Google for your query..."
        });
      case 'youtube_search':
        return res.json({
          type,
          query: gemResult.query,
          response: "Searching YouTube for your query..."
        });
      case 'wikipedia_search':
        return res.json({
          type,
          query: gemResult.query,
          response: "Searching Wikipedia for your query..."
        });
      case 'news_search':
        return res.json({
          type,
          query: gemResult.query,
          response: "Searching for the latest news..."
        });
      case 'joke':
        return res.json({
          type,
          joke: gemResult.joke || "Here's a joke for you!"
        });
      case 'quote':
        return res.json({
          type,
          quote: gemResult.quote || "Here's an inspirational quote!"
        });
      case 'advice':
        return res.json({
          type,
          advice: gemResult.advice || "Here's some advice!"
        });
      case 'weather':
        return res.json({
          type,
          location: gemResult.location,
          response: "Getting weather information..."
        });
      case 'open_application':
        // If the assistant was asked to open YouTube and also provided a search query,
        // treat it as a youtube_search so the frontend opens the YouTube search page.
        if (gemResult.app && gemResult.app.toLowerCase() === 'youtube') {
          // prefer explicit gemini query
          if (gemResult.query) {
            return res.json({ type: 'youtube_search', query: gemResult.query });
          }

          // fallback: try to extract a search phrase from the raw voice command text
          try {
            const re = /youtube(?:\s*(?:and\s*)?(?:search(?:\s+for)?|play)?\s*)?(.*)$/i;
            const m = command.match(re);
            if (m && m[1] && m[1].trim()) {
              let q = m[1].trim();
              q = q.replace(/^(for|to)\s+/i, '').replace(/\bplease\b/i, '').trim();
              if (q) return res.json({ type: 'youtube_search', query: q });
            }
          } catch (err) {
            console.error('YouTube query extraction error:', err.message);
          }
        }

        return res.json({
          type: 'open_application',
          app: gemResult.app,
          query: gemResult.query || null,
          response: `Opening ${gemResult.app || 'application'}...`
        });
      case 'unknown':
        return res.json({
          type: "unknown",
          response: gemResult.response || "Sorry, I cannot understand the request type."
        });
      default:
        return res.json({
          type: "unknown",
          response: "Sorry, I cannot understand the request type."
        });

    }

  } catch (error) {
    return res.status(500).json({response:"Sorry i cannot process your request at the moment"})
  }
}
