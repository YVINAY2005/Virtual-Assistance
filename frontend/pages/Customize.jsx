import React, { useContext, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import vImage1 from '../src/assets/vImage1.jpg'
import vImage2 from '../src/assets/vImage2.jpg'
import vImage3 from '../src/assets/vImage3.webp'
import vImage4 from '../src/assets/vImage4.jpg'
import vImage5 from '../src/assets/vImage5.jpg'
import vImage6 from '../src/assets/vImage6.jpeg'
import { RiImageAddLine } from "react-icons/ri";

import Card from '../components/Card'
import { userDataContext } from '../context/UserContext'


const Customize = () => {
  const { serverUrl, userData, setUserData ,FrontendImage,setFrontendImage,BackendImage,setBackendImage,selectedImage,setSelectedImage}=useContext(userDataContext)
  
  const inputImage=useRef()
  const navigate=useNavigate()


  const handleImage=(e)=>{
    const file=e.target.files[0]
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))

  }


  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-blue-900/10 animate-pulse"></div>
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-blue-600 bg-clip-text text-transparent drop-shadow-lg animate-bounce relative z-10">Select your Assistance Image</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto relative z-10">
      <Card   image={vImage1}/>
      <Card   image={vImage2}/>
      <Card   image={vImage3}/>
      <Card   image={vImage4}/>
      <Card   image={vImage5}/>
      <Card   image={vImage6}/>
      <div onClick={()=>{
        inputImage.current.click()
      }} className="border-2 border-dashed border-gray-500 p-6 rounded-2xl hover:border-purple-400 hover:shadow-2xl hover:scale-110 transition-all duration-500 cursor-pointer flex items-center justify-center bg-gray-800/50 backdrop-blur-sm">
        {!FrontendImage &&  <RiImageAddLine className="text-6xl text-gray-400 animate-pulse hover:text-purple-400 transition-colors" />}
        {FrontendImage && <img src={FrontendImage} className="w-full h-40 object-cover rounded-lg shadow-lg" />}
      </div>
    <input type="file" accept='image/*' hidden ref={inputImage} onChange={handleImage} />

      </div>
      {selectedImage && <button className="mt-8 px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl hover:from-green-600 hover:to-blue-700 hover:scale-110 hover:shadow-2xl transition-all duration-300 block mx-auto animate-pulse"  onClick={() => navigate("/customize2")}>next</button>}

    </div>
  )
}

export default Customize
