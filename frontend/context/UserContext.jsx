import React, { createContext, useState, useEffect } from "react";
import axios from "axios"; // ✅ you’re using axios but didn’t import it

export const userDataContext = createContext();

const serverUrl = "http://localhost:8000";

const UserContext = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [FrontendImage,setFrontendImage]=useState(null)
  const [BackendImage,setBackendImage]=useState(null)
  const[selectedImage,setSelectedImage]=useState(null)

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


  const getGeminiResponse=async(command)=>{
    try {
      const result=await axios.post(`${serverUrl}/api/user/asktoassistance`,{command},{withCredentials:true})
      return result.data
      
    } catch (error) {
     console.log(error) 
    }

  }

  useEffect(() => {
    handleCurrentUser();
  }, []);

  const value = { serverUrl, userData, setUserData ,FrontendImage,setFrontendImage,BackendImage,setBackendImage,selectedImage,setSelectedImage,getGeminiResponse};

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
};

export default UserContext;
