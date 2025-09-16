import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Signup from '../pages/Signup'
import SignIn from '../pages/SignIn'
import { ToastContainer, toast } from 'react-toastify';
import Customize from '../pages/Customize';
import { userDataContext } from '../context/UserContext';
import Home from '../pages/Home';
import Customize2 from '../pages/Customize2';


const App = () => {
  const {userData,setUserData}=useContext(userDataContext)
  return (
    <Routes>
      <Route path='/' element={(userData?.assistanceImage && userData?.assistantName)?<Home/>:<Navigate to={"/customize"}/>}/>
      <Route path='/signup' element={!userData?<Signup/>:<Navigate to={"/"}/>}/>
      <Route path='/signin' element={!userData?<SignIn/>:<Navigate to={"/"}/>}/>
      <Route path='/customize' element={userData?<Customize/>:<Navigate to={"/signin"}/>}/>
      <Route path='/customize' element={userData?<Customize/>:<Navigate to={"/signin"}/>}/>
      <Route path='/customize2' element={userData?<Customize2/>:<Navigate to={"/signin"}/>}/>
    </Routes>
  )
}

export default App
