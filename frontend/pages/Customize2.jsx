import React, { useContext, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import axios from 'axios'
import { MdKeyboardBackspace } from "react-icons/md";
import { useNavigate } from 'react-router-dom'

const Customize2 = () => {
  const {userData,backendImage,selectedImage,serverUrl,setUserData}=useContext(userDataContext)
  const [AssistanceName,setAssistanceName]=useState(userData?.assistanceName || "")
  const navigate=useNavigate()


  const handleUpdateAssistance=async()=>{
    try {

      const formData=new FormData()
      formData.append("assistanceName",AssistanceName)
      if(backendImage){
        formData.append("assistantImage",backendImage)
      }else{
        formData.append("imageUrl",selectedImage)
      }
      const result=await axios.post(`${serverUrl}/api/user/update`,formData,{
        withCredentials: true
      })
      console.log(result.data);
      setUserData(result.data)
      navigate("/")
      
    } catch (error) {
      console.log(error);
      
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 relative overflow-hidden">
      <MdKeyboardBackspace onClick={()=>navigate("/customize")} className="absolute top-4 left-4 text-white text-2xl cursor-pointer hover:text-gray-300 transition-colors z-20" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20 animate-pulse"></div>
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in border border-white/20 relative z-10">
        <h1 className="text-3xl font-bold mb-6 text-center text-white drop-shadow-lg">Enter Your <span className="text-blue-400 animate-pulse">Assistance Name</span></h1>
        <input type="text" placeholder='Enter Your Assistance Name' required
        onChange={(e)=>setAssistanceName(e.target.value)} value={AssistanceName}
        className="w-full p-3 mb-4 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
        />
        {AssistanceName && <button onClick={()=>{
          handleUpdateAssistance()

        }} className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 hover:scale-105 hover:shadow-lg transition-all duration-300">Finally Created Your Assistance Name</button>}
      </div>
    </div>
  )
}

export default Customize2
