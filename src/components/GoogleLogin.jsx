import React from 'react'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../config/firebase'
import { FcGoogle } from "react-icons/fc"
import Footer from './Footer'

export default function GoogleLogin({ setUser }) {
  
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      setUser(result.user) // Store user info on successful login
      window.location.href = '/chat'
    } catch (error) {
      console.error('Google login error:', error)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#212121]">

      <header className='fixed top-2 flex justify center items-center gap-2'><img src="../public/star.png" alt="" height={50} width={50} className='cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 hover:rotate-90'/><h1 className='text-3xl text-white'>LowCode GPT</h1></header>

      <div className="flex flex-col gap-2">
      <div className='text-white font-semibold text-2xl'>Login to Use LowCode GPT</div>
        <button
          onClick={handleLogin}
          className="flex items-center justify-center mx-auto px-2 py-2 text-md sm:text-base bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          <FcGoogle size={25} className="mr-2" />
          <span>Continue with Google</span>
        </button>
      </div>
      
      <footer className='fixed bottom-0 w-full p-1 bg-black'>
    <p className='text-center text-xs text-white'>Made with <span className='text-red-500'>&#10084;</span> by Sourav. This App is totally powered by Gemini API.</p>
    </footer>
    </div>
  )
}