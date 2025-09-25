
import React, { useContext, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useEffect } from 'react'
import { useRef } from 'react'
import aiImg from "../src/assets/voice.gif";
import userImg from "../src/assets/GOOD GIF.gif";

const Home = () => {
  const { userData, setUserData, serverUrl,getGeminiResponse, selectedVoice } = useContext(userDataContext)
  const [loader, setLoader] = useState(false)
  const navigate = useNavigate()
  const [listening, setListening] = useState(false)
  const [userText,setUserText]=useState("")
  const [aiText,setAiText]=useState("")
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const isSpeakingRef=useRef(false)
  const recognitionRef=useRef(null)
  const isRecognizingRef=useRef(false)
  const synth=window.speechSynthesis
  // Create a link element for programmatic navigation
  const assistantLinkRef = useRef(null)
  
  useEffect(() => {
    // Create a hidden link element for assistant-controlled navigation
    const link = document.createElement('a')
    link.style.display = 'none'
    document.body.appendChild(link)
    assistantLinkRef.current = link
    return () => document.body.removeChild(link)
  }, [])

  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(history));
  }, [history])

  // Assistant-controlled navigation
  const assistantNavigate = (url) => {
    if (!assistantLinkRef.current) return false
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      newWindow.focus();
      // Initialize voice recognition in new window
      if (newWindow.document) {
        try {
          // Pass necessary data to new window
          newWindow.userData = userData;
          newWindow.assistantNavigate = assistantNavigate;
          newWindow.handleCommand = handleCommand;
          // Start recognition in new window
          const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
          recognition.continuous = true;
          recognition.lang = "en-US";
          recognition.onstart = () => console.log("Recognition started in new tab");
          recognition.start();
        } catch (error) {
          console.error("Error setting up voice in new tab:", error);
        }
      }
      return true;
    } else {
      // Fallback if popup is blocked
      assistantLinkRef.current.href = url;
      assistantLinkRef.current.target = '_blank';
      assistantLinkRef.current.rel = 'noopener noreferrer';
      assistantLinkRef.current.click();
      return true;
    }
  }


  const handleLogout = async () => {
    setLoader(true)
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true })
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      console.log(error)
    } finally {
      setLoader(false)
    }
  }
  const startRecognition=()=>{
    try {
      recognitionRef.current?.start()
      setListening(true)
      
    } catch (error) {
      if(!error.message.includes("start")){
        console.error("Recognition error:",error);
      }
      
    }
  }

  const speak = async (text) => {
    console.log('Speaking:', text);
    if (!window.speechSynthesis) {
      console.warn('Speech synthesis not available');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log("Selected voice:", selectedVoice.name);
    } else {
      console.warn("No voice selected, using default");
    }

    utterance.onstart = () => {
      console.log('Speech started');
      isSpeakingRef.current = true;
    };

    utterance.onend = () => {
      console.log('Speech ended');
      setAiText("");
      isSpeakingRef.current = false;
      startRecognition();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      if (event.error === 'not-allowed') {
        console.log('Speech synthesis requires user interaction. Please try again after clicking somewhere on the page.');
      }
      isSpeakingRef.current = false;
      startRecognition();
    };

    try {
      isSpeakingRef.current = true;
      synth.speak(utterance);
    } catch (error) {
      console.error('Error during speech synthesis:', error);
      isSpeakingRef.current = false;
      startRecognition();
    }
  }

  /**
   * Handles command based on type.
   * @param {Object} data - The command data.
   * @param {string} data.type - The type of command.
   * @param {string} data.userInput - The user input.
   * @param {string} data.response - The response.
   * @param {string} [data.query] - The query for searches.
   * @param {string} [data.location] - The location for weather or directions.
   * @param {string} [data.destination] - The destination for directions.
   * @param {string} [data.text] - The text for translation or grammar check.
   * @param {string} [data.to] - The target language for translation.
   * @param {string} [data.word] - The word for definition or spell check.
   */
  const handleCommand = (data) => {
    const {type, userInput, response, query, location, destination, text, to, word} = data
    switch(type) {
      case 'google_search': {
        const q = encodeURIComponent(query || userInput)
        assistantNavigate(`https://www.google.com/search?q=${q}`)
        speak(`Searching Google for ${query || userInput}`)
        break
      }
      case 'web_search': {
        // Handle various web searches
        const q = encodeURIComponent(query || userInput)
        const searchType = data.searchType || 'google'
        let url = 'https://www.google.com/search?q=' + q
        
        switch(searchType) {
          case 'google':
            url = `https://www.google.com/search?q=${q}`
            break
          case 'linkedin':
            url = `https://www.linkedin.com/search/results/all/?keywords=${q}`
            break
          case 'instagram':
            url = `https://www.instagram.com/explore/tags/${q}`
            break
          case 'facebook':
            url = `https://www.facebook.com/search/top?q=${q}`
            break
          case 'twitter':
            url = `https://twitter.com/search?q=${q}`
            break
        }
        assistantNavigate(url)
        speak(`Searching ${searchType} for ${query || userInput}`)
        break
      }
      case 'youtube_search': {
        // Prefer explicit query field from backend; fall back to the raw userInput.
        const searchText = (data.query || userInput || query || '').trim()
        const q = encodeURIComponent(searchText)
        const ytUrl = `https://www.youtube.com/results?search_query=${q}`
        assistantNavigate(ytUrl)
        speak(`Searching YouTube for ${searchText}`)
        break
      }
      case 'wikipedia_search': {
        const q = encodeURIComponent(query || userInput)
        assistantNavigate(`https://en.wikipedia.org/wiki/Special:Search?search=${q}`)
        speak(`Searching Wikipedia for ${query || userInput}`)
        break
      }
      case 'github_search': {
        const q = encodeURIComponent(query || userInput)
        assistantNavigate(`https://github.com/search?q=${q}`)
        speak(`Searching GitHub for ${query || userInput}`)
        break
      }
      case 'stackoverflow_search': {
        const q = encodeURIComponent(query || userInput)
        assistantNavigate(`https://stackoverflow.com/search?q=${q}`)
        speak(`Searching Stack Overflow for ${query || userInput}`)
        break
      }
      case 'news_search': {
        const q = encodeURIComponent(query || userInput)
        assistantNavigate(`https://news.google.com/search?q=${q}`)
        speak(`Searching news for ${query || userInput}`)
        break
      }
      case 'get_directions': {
        const dest = encodeURIComponent(destination || userInput)
        assistantNavigate(`https://www.google.com/maps/dir//${dest}`)
        speak("Opening directions")
        break
      }
      case 'find_nearby_places': {
        const placeType = encodeURIComponent(query || userInput)
        assistantNavigate(`https://www.google.com/maps/search/${placeType}`)
        speak("Finding nearby places")
        break
      }
      case 'translate_text': {
        const txt = encodeURIComponent(text || userInput)
        const lang = to || 'en'
        assistantNavigate(`https://translate.google.com/?sl=auto&tl=${lang}&text=${txt}`)
        speak("Opening translation")
        break
      }
      case 'define_word': {
        const def = data.definition || `Definition for ${word || userInput}`;
        speak(def);
        data.response = def; // to display the text
        break
      }
      case 'spell_check': {
        const w = encodeURIComponent(word || userInput)
        assistantNavigate(`https://www.google.com/search?q=spell+check+${w}`)
        speak("Opening spell check")
        break
      }
      case 'grammar_check': {
        const txt = encodeURIComponent(text || userInput)
        assistantNavigate(`https://www.google.com/search?q=grammar+check+${txt}`)
        speak("Opening grammar check")
        break
      }
      case 'weather': {
        const loc = encodeURIComponent(location || userInput)
        assistantNavigate(`https://www.google.com/search?q=weather+${loc}`)
        speak("Opening weather information")
        break
      }
      case 'calculator': {
        assistantNavigate('https://www.google.com/search?q=calculator')
        speak("Opening calculator")
        break
      }
      case 'math_calculation': {
        const expression = data.expression || userInput
        // Use Google's calculator for math expressions
        assistantNavigate(`https://www.google.com/search?q=${encodeURIComponent(expression)}`)
        speak(`Calculating ${expression}`)
        break
      }
      case 'calendar': {
        assistantNavigate('https://calendar.google.com')
        speak("Opening calendar")
        break
      }
      case 'instagram': {
        assistantNavigate('https://www.instagram.com')
        break
      }
      case 'facebook': {
        assistantNavigate('https://www.facebook.com')
        break
      }
      case 'whatsapp': {
        assistantNavigate('https://web.whatsapp.com')
        break
      }
      case 'play_music': {
        assistantNavigate('https://music.youtube.com')
        break
      }
      case 'linkedin': {
        // Open LinkedIn homepage
        const linkedInWindow = window.open('https://www.linkedin.com', '_blank');
        if (linkedInWindow) {
          linkedInWindow.focus();
          // Store reference for later searches
          window.linkedInWindow = linkedInWindow;
        }
        break
      }
      case 'linkedin_search': {
        // If LinkedIn window is open, perform search inside it
        if (window.linkedInWindow && !window.linkedInWindow.closed) {
          const searchQuery = data.query || userInput || '';
          const encodedQuery = encodeURIComponent(searchQuery);
          const searchUrl = `https://www.linkedin.com/search/results/all/?keywords=${encodedQuery}`;
          window.linkedInWindow.location.href = searchUrl;
          window.linkedInWindow.focus();
          speak(`Searching LinkedIn for ${searchQuery}`);
        } else {
          // If LinkedIn not open, open it with search query
          const searchQuery = data.query || userInput || '';
          const encodedQuery = encodeURIComponent(searchQuery);
          const searchUrl = `https://www.linkedin.com/search/results/all/?keywords=${encodedQuery}`;
          const newWindow = window.open(searchUrl, '_blank');
          if (newWindow) {
            newWindow.focus();
            window.linkedInWindow = newWindow;
          }
          speak(`Opening LinkedIn and searching for ${searchQuery}`);
        }
        break
      }
      case 'twitter': {
        window.open('https://twitter.com', '_blank')
        break
      }
      case 'vscode': {
        alert('Please open VSCode application manually.')
        break
      }
      case 'open_application': {
        const app = (data.app || userInput.toLowerCase().replace('open ', '').trim()).toLowerCase()
        // If backend provided a query, prefer it; otherwise attempt to extract from userInput
        const searchText = (data.query || userInput || '').toString().replace(new RegExp(`open\s+${app}`, 'i'), '').trim()
        let url = `https://www.${app}.com`
        // Special cases for common apps
        if (app.toLowerCase() === 'youtube') {
          if (searchText) {
            const q = encodeURIComponent(searchText)
            url = `https://www.youtube.com/results?search_query=${q}`
          } else {
            url = 'https://www.youtube.com'
          }
        } else if (app.toLowerCase() === 'facebook') {
          url = 'https://www.facebook.com'
        } else if (app.toLowerCase() === 'instagram') {
          url = 'https://www.instagram.com'
        } else if (app.toLowerCase() === 'twitter') {
          url = 'https://www.twitter.com'
        } else if (app.toLowerCase() === 'linkedin') {
          url = 'https://www.linkedin.com'
        } else if (app.toLowerCase() === 'whatsapp') {
          url = 'https://web.whatsapp.com'
        } else if (app.toLowerCase() === 'vscode') {
          alert('Please open VSCode application manually.')
          break
        }
        console.log("Opening URL:", url);
        
        // Open in new tab and keep track of opened windows
        const newWindow = window.open(url, '_blank');
        if (newWindow) {
          newWindow.focus();
          // Initialize voice recognition in the new window
          if (newWindow.document) {
            try {
              // Pass necessary data to new window
              newWindow.userData = userData;
              newWindow.assistantNavigate = assistantNavigate;
              newWindow.handleCommand = handleCommand;
              // Start recognition in new window
              const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
              recognition.continuous = true;
              recognition.lang = "en-US";
              recognition.onstart = () => console.log("Recognition started in new tab");
              recognition.start();
            } catch (error) {
              console.error("Error setting up voice in new tab:", error);
            }
          }
        } else {
          // Fallback if popup is blocked
          window.location.href = url;
        }
        speak(`Opening ${app} in new tab`);
        break
      }
      case 'set_alarm': {
        const alarmTime = data.alarm || userInput
        speak(`Alarm set for ${alarmTime}`)
        // For simplicity, alert after 5 seconds for demo
        setTimeout(() => {
          alert(`Alarm: ${alarmTime}`)
        }, 5000)
        break
      }
      case 'set_reminder': {
        const reminder = data.reminder || userInput
        speak(`Reminder set: ${reminder}`)
        // For simplicity, alert after 5 seconds for demo
        setTimeout(() => {
          alert(`Reminder: ${reminder}`)
        }, 5000)
        break
      }
      case 'logout': {
        speak('Logging out')
        handleLogout()
        break
      }
      case 'time': {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        });
        const response = `The current time is ${timeString}`;
        speak(response);
        return {
          type: 'time',
          response: response
        };
      }
      case 'date': {
        const now = new Date()
        const dateString = now.toLocaleDateString()
        const month = now.toLocaleString('default', { month: 'long' })
        const year = now.getFullYear()
        speak(`Today's date is ${dateString}. It's ${month}, ${year}`)
        break
      }
      case 'calendar_info': {
        const now = new Date()
        const month = now.toLocaleString('default', { month: 'long' })
        const year = now.getFullYear()
        speak(`We are currently in ${month}, ${year}`)
        break
      }
      default: {
        console.log(`Unhandled command type: ${type}`)
        speak("This feature is not available in the web version.")
      }
    }
  }


  useEffect(()=>{
    const SpeechRecognition=window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition=new SpeechRecognition()
    recognition.continuous=true,
    recognition.lang="en-US"

    recognitionRef.current=recognition

    


    const safeRecognition=()=>{
      
      if(!isSpeakingRef.current && !isRecognizingRef.current){
        try {
          recognition.start()
          console.log("Recognition started");
          
        } catch (error) {
          if(error.name!=="InvalidStateError"){
            console.log("Recognition error:",error);
            
          }
          
        }
        
      }
    }

    recognition.onstart=()=>{
      console.log("Recognition started");
      isRecognizingRef.current=true
      setListening(true)
      

    }

    recognition.end=()=>{
      console.log("Recognition Ended");
      isRecognizingRef.current=false
      setListening(false);
      
    
    if(!isSpeakingRef.current){
      setTimeout(()=>{
        safeRecognition();
      },1000)
    }
  }

  recognition.onerror=(event)=>{
    console.log("Recognition Error:",event.error);
    isRecognizingRef.current=false
    setListening(false);
    if(event.error!=="aborted" && !isSpeakingRef.current){
      setTimeout(() => {
        safeRecognition();
        
      }, 1000);
    }
    
  }

    recognition.onresult=async(e)=>{
      const transcript=e.results[e.results.length-1][0].transcript.trim()
      console.log("transcript",transcript);
      if(transcript.toLowerCase().includes(userData.assistanceName.toLowerCase())){
        setAiText("")
        setUserText(transcript)
        recognition.stop()
        isRecognizingRef.current=false
        setListening(false)

        const data=await getGeminiResponse(transcript)
        console.log("Received data from Gemini:", data);
    const speakableTypes = ['general', 'joke', 'quote', 'advice', 'time', 'date', 'math_calculation', 'unknown'];
    const commandTypes = ['google_search', 'youtube_search', 'wikipedia_search', 'github_search', 'stackoverflow_search', 'news_search', 'get_directions', 'find_nearby_places', 'translate_text', 'define_word', 'spell_check', 'grammar_check', 'weather', 'calculator', 'calendar', 'instagram', 'facebook', 'whatsapp', 'play_music', 'linkedin', 'twitter', 'vscode', 'open_application', 'set_alarm', 'set_reminder', 'logout', 'time', 'date'];
    let responseText = "";
    if(commandTypes.includes(data.type)){
      // Remove 'response' field if present for command types
      if(data.response) delete data.response;
      console.log(`Handling command type: ${data.type}`);
      handleCommand(data);
      responseText = data.response || "";
      setAiText(data.response)
      setUserText("")
    } else if(speakableTypes.includes(data.type)){
      responseText = data.response;
      if(data.type === 'joke'){
        responseText = data.joke || data.response;
      } else if(data.type === 'math_calculation'){
        responseText = data.result || data.response;
      }
      setAiText(responseText);
      setUserText("");
      speak(responseText);
    } else {
      console.log(`Unhandled response type: ${data.type}`);
      responseText = data.response || "This feature is not available in the web version.";
      speak(responseText);
    }
    setHistory(prev => [...prev, {user: transcript, ai: responseText}])

      }

    }

    const fallback=setInterval(() => {
      if(!isRecognizingRef.current && !isSpeakingRef.current){
        safeRecognition()
      }
      
    },10000);
    safeRecognition()
    return()=>{
      recognition.stop()
      setListening(false)
      isRecognizingRef.current=false
      clearInterval(fallback)
    }

  


  },[])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      <div className="absolute top-4 right-4 flex space-x-2 z-20">
        <button onClick={handleLogout} disabled={loader} className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white text-sm rounded-lg hover:from-green-600 hover:to-blue-700 hover:scale-105 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
          Logout
        </button>
        <button onClick={() => navigate('/customize')} disabled={loader} className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white text-sm rounded-lg hover:from-green-600 hover:to-blue-700 hover:scale-105 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
          Customize
        </button>
      </div>
      <div className="absolute top-4 left-4 p-2 rounded-lg shadow-lg max-w-xs z-20">
        <button className="px-3 py-1 bg-gradient-to-r from-green-500 to-blue-600 text-white text-sm rounded-lg hover:from-green-600 hover:to-blue-700 hover:scale-105 transition-all duration-300" onClick={() => setShowHistory(!showHistory)}>History</button>
        {showHistory && (
          <div className="max-h-48 overflow-y-auto border-t border-gray-600 pt-1">
            {history.length === 0 ? (
              <p className="text-gray-400 text-xs">No history yet</p>
            ) : (
              history.map((item, index) => (
                <div key={index} className="mb-1">
                  <p className="text-green-400 text-xs truncate">U: {item.user}</p>
                  <p className="text-blue-400 text-xs truncate">A: {item.ai}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20 relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-2xl bg-gradient-to-r from-blue-100 to-white-600 bg-clip-text text-transparent text-center animate-bounce" >
          Welcome to <span className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-2xl bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent text-center animate-bounce">Virtual Assistance</span>
        </h1>

        {userData?.assistanceImage && (
          <img
            src={userData.assistanceImage}
            alt="Assistant"
            className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover mb-4 mx-auto shadow-2xl ring-4 ring-blue-400 animate-pulse"
          />
        )}
        <h1 className="text-xl md:text-2xl mb-10 drop-shadow-lg text-gray-300 text-center">
          I'm {userData?.assistanceName}
        </h1>
        {aiText ? (
          <img
            src={aiImg}
            alt="AI"
            className="w-24 h-24 rounded-full object-cover mx-auto mb-4 shadow-lg border-4 border-blue-500 animate-pulse"
          />
        ) : (
          <img
            src={userImg}
            alt="User"
            className="w-24 h-24 rounded-full object-cover mx-auto mb-4 shadow-lg border-4 border-green-500 animate-pulse"
          />
        )}
        <h1 className="text-white">{userText || aiText || null}</h1>
        {!voiceEnabled && (
          <button onClick={() => { setVoiceEnabled(true); speak('Voice enabled'); }} className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300">
            Enable Voice
          </button>
        )}
      </div>
    </div>
  );
}

export default Home
