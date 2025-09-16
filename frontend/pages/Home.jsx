import React from 'react'

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20 animate-pulse"></div>
      <div className="text-center text-white animate-bounce relative z-10">
        <h1 className="text-6xl font-bold mb-6 drop-shadow-2xl bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Welcome to Virtual Assistance</h1>
        <p className="text-2xl mb-10 drop-shadow-lg text-gray-300">Your AI assistant is ready to help!</p>
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 border border-white/20">
          <p className="text-xl text-gray-200">Explore features and customize your experience.</p>
          <div className="mt-4 flex justify-center space-x-4">
            <div className="w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
            <div className="w-4 h-4 bg-purple-400 rounded-full animate-ping animation-delay-200"></div>
            <div className="w-4 h-4 bg-green-400 rounded-full animate-ping animation-delay-400"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
