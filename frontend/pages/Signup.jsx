import React, { useContext } from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { userDataContext } from '../context/UserContext';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';


function Signup  () {
    const navigate=useNavigate();
    const [name,setName]=useState('')
    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
    const {serverUrl,userData,setUserData}=useContext(userDataContext)
    const [loader,setLoader]=useState("")
    

    const handleSignUp=async(e)=>{
      e.preventDefault()
      setLoader(true)
      try {
       let result = await axios.post(
  `${serverUrl}/api/auth/signup`,
  { name, email, password },
  { withCredentials: true }  // ✅ correct way
);

        // Set user data from response
        setUserData(result.data);
        localStorage.setItem('token', result.data.token);
        setLoader(false)
        // Redirect to customize page only if first time signup
        if (result.data && result.data.isFirstTimeUser) {
          navigate("/customize")
        } else {
          navigate("/")
        }
      } catch (error) {
        setUserData(null)
        toast.error(error.response?.data?.message || error.message)
        setLoader(false)
      }
        
    }
    
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-blue-900/20 animate-pulse"></div>
        <form onSubmit={handleSignUp} className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in border border-white/20 relative z-10">
            <h1 className="text-3xl font-bold mb-6 text-center text-white drop-shadow-lg">Register to <span className="text-green-400 animate-pulse">Virtual Assistance</span></h1>
            <input type="text" placeholder='Enter Your Name' required onChange={(e)=>setName(e.target.value)} value={name} className="w-full p-3 mb-4 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-green-400 hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"/>
            <input type="email" placeholder='Enter Your Email' required onChange={(e)=>setEmail(e.target.value)} value={email} className="w-full p-3 mb-4 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-green-400 hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"/>
            <input type="password" placeholder='Enter Your Password' required onChange={(e)=>setPassword(e.target.value)} value={password} className="w-full p-3 mb-6 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-green-400 hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"/>

            <button disabled={loader} className="w-full p-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 hover:scale-105 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
              {loader ? "Loading..." : "Sign Up"}
            </button>
            <p onClick={()=>navigate("/signin")} className="mt-4 text-center text-white/80 cursor-pointer hover:text-white transition-colors">Already have an account ? <span className="text-green-400 hover:underline hover:text-green-300">Sign In</span></p>
        </form>
    </div>
  )
}

export default Signup
