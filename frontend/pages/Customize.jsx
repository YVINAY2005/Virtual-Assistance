import React, { useContext, useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import vImage1 from '../src/assets/vImage1.jpg'
import vImage2 from '../src/assets/vImage2.jpg'
import vImage3 from '../src/assets/vImage3.webp'
import vImage4 from '../src/assets/vImage4.jpg'
import vImage5 from '../src/assets/vImage5.jpg'
import vImage6 from '../src/assets/vImage6.jpeg'
import { RiImageAddLine } from "react-icons/ri";
import { MdKeyboardBackspace } from "react-icons/md";

import Card from '../components/Card'
import { userDataContext } from '../context/UserContext'


const Customize = () => {
  const { serverUrl, userData, setUserData ,FrontendImage,setFrontendImage,BackendImage,setBackendImage,selectedImage,setSelectedImage, selectedVoice, setSelectedVoice}=useContext(userDataContext)

  const inputImage=useRef()
  const navigate=useNavigate()
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0]);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [selectedVoice, setSelectedVoice]);

  const handleImage=(e)=>{
    const file=e.target.files[0]
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))

  }


  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
            <MdKeyboardBackspace onClick={()=>navigate("/")} className="absolute top-4 left-4 text-white text-2xl cursor-pointer hover:text-gray-300 transition-colors z-10" />
      

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
      <div className="mt-8 max-w-md mx-auto relative z-10">
        <h2 className="text-2xl font-bold mb-4 text-center text-white">Select Voice</h2>
        <select
          value={selectedVoice ? selectedVoice.name : ''}
          onChange={(e) => {
            const voice = voices.find(v => v.name === e.target.value);
            setSelectedVoice(voice);
          }}
          className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
        >
          {voices.map((voice, index) => (
            <option key={index} value={voice.name} className="text-black">
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </div>
      {selectedImage && <button className="mt-8 px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl hover:from-green-600 hover:to-blue-700 hover:scale-110 hover:shadow-2xl transition-all duration-300 block mx-auto animate-pulse"  onClick={() => navigate("/customize2")}>next</button>}

    </div>
  )
}

export default Customize
