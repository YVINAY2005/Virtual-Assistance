import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
export const userDataContext = createContext();

const serverUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const UserContext = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [FrontendImage,setFrontendImage]=useState(null)
  const [BackendImage,setBackendImage]=useState(null)
  const[selectedImage,setSelectedImage]=useState(null)
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voices, setVoices] = useState([]);

  const setSelectedVoiceWithStorage = (voice) => {
    setSelectedVoice(voice);
    if (voice) {
      localStorage.setItem('selectedVoiceName', voice.name);
    } else {
      localStorage.removeItem('selectedVoiceName');
    }
  };

  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
      });
      setUserData(result.data);
      console.log(result.data);
    } catch (error) {
      console.log(error);
    }
  };


  const getGeminiResponse = async (command) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/user/asktoassistance`,
        { command },
        { withCredentials: true }
      );

      if (!result.data || !result.data.type) {
        throw new Error("Invalid response format from server");
      }

      return result.data;
    } catch (error) {
      console.error("Error in getGeminiResponse:", error);
      // Rethrow the error so it can be handled by the component
      throw error;
    }
  }

  useEffect(() => {
    handleCurrentUser();
    // Load voices and selectedVoice
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      const savedVoiceName = localStorage.getItem('selectedVoiceName');
      if (savedVoiceName) {
        const voice = availableVoices.find(v => v.name === savedVoiceName);
        if (voice) {
          setSelectedVoice(voice);
        }
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const value = { serverUrl, userData, setUserData ,FrontendImage,setFrontendImage,BackendImage,setBackendImage,selectedImage,setSelectedImage,getGeminiResponse, selectedVoice, setSelectedVoice: setSelectedVoiceWithStorage};

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
};

export default UserContext;
