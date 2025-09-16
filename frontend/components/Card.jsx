import React, { useContext } from 'react'
import { userDataContext } from '../context/UserContext'

const Card = ({image}) => {

   const { serverUrl, userData, setUserData ,FrontendImage,setFrontendImage,BackendImage,setBackendImage,selectedImage,setSelectedImage}=useContext(userDataContext)
  return (
    <div onClick={()=>setSelectedImage(image)} className="cursor-pointer hover:scale-110 hover:shadow-2xl hover:rotate-1 transition-all duration-500 rounded-2xl overflow-hidden bg-gray-800/50 backdrop-blur-sm border border-gray-700 relative group">
        <img src= {image} alt="" className="w-full h-40 object-cover group-hover:brightness-110 transition-all duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
        <div className="absolute bottom-2 left-2 text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">Select</div>
    </div>
  )
}

export default Card
