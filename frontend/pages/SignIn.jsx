import React, { useContext } from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { userDataContext } from '../context/UserContext';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';


function SignIn  () {
    const navigate=useNavigate();
    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
    const {serverUrl,userData,setUserData}=useContext(userDataContext)
    const [loader,setLoader]=useState("")

    const handleSignIn=async(e)=>{
      e.preventDefault()
      setLoader(true)
      try {
        let result = await axios.post(
            `${serverUrl}/api/auth/signin`,
                { email, password },
                  { withCredentials: true }  
);

        setUserData(result.data);
        localStorage.setItem('token', result.data.token);
        setLoader(false)
         navigate("/")
        
        
      } catch (error) {
         setUserData(null)
        toast.error(error.message)
        setLoader(false)
      }
        
    }
    
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20 animate-pulse"></div>
        <form onSubmit={handleSignIn} className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in border border-white/20 relative z-10">
            <h1 className="text-3xl font-bold mb-6 text-center text-white drop-shadow-lg">sign in <span className="text-blue-400 animate-pulse">Virtual Assistance</span></h1>
            <input type="email" placeholder='Enter Your Email' required onChange={(e)=>setEmail(e.target.value)} value={email} className="w-full p-3 mb-4 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"/>
            <input type="password" placeholder='Enter Your Password' required onChange={(e)=>setPassword(e.target.value)} value={password} className="w-full p-3 mb-6 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"/>

            <button disabled={loader} className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 hover:scale-105 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">{loader?"loading...":"Sign In"}</button>
            <p onClick={()=>navigate("/signup")} className="mt-4 text-center text-white/80 cursor-pointer hover:text-white transition-colors">want to create a new account ? <span className="text-blue-400 hover:underline hover:text-blue-300">Sign Up</span></p>
        </form>
    </div>
  )
}

export default SignIn
