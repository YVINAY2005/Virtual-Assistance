import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
export const userDataContext = createContext();

const serverUrl = import.meta.env.VITE_BACKEND_URL || "https://virtual-assistance-backend-a2fu.onrender.com";

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
    const token = localStorage.getItem('token');
    if (!token) {
      setUserData(null);
      return;
    }

    try {
      const result = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUserData(result.data);
      console.log("Current user:", result.data);
    } catch (error) {
      // 401 is expected when user is not logged in or token expired
      if (error.response?.status === 401) {
        // User not authenticated or token expired - clear everything
        setUserData(null);
        localStorage.removeItem('token');
      } else if (error.code !== 'ERR_NETWORK') {
        // Only log non-network errors
        console.error("Error fetching current user:", error.message);
      }
    }
  };


  const getGeminiResponse = async (command) => {
    const token = localStorage.getItem('token');
    try {
      console.log("Sending request to:", `${serverUrl}/api/user/asktoassistance`);
      const result = await axios.post(
        `${serverUrl}/api/user/asktoassistance`,
        { command },
        {
          withCredentials: true,
          headers: {
            Authorization: token ? `Bearer ${token}` : ""
          }
        }
      );

      if (!result.data || !result.data.type) {
        throw new Error("Invalid response format from server");
      }

      return result.data;
    } catch (error) {
      console.error("Error in getGeminiResponse:", error);
      if (error.response?.status === 401) {
        console.error("Unauthorized - token may be missing or invalid");
        console.error("Response:", error.response?.data);
      }
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
