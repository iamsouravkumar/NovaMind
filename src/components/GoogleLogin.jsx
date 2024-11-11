import React, { useEffect } from 'react'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../../config/firebase'
import { FcGoogle } from "react-icons/fc"
import { motion } from "framer-motion"
import { toast } from 'react-hot-toast';

export default function GoogleLogin({ setUser, user }) {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      setUser(result.user) // Store user info on successful login
      window.location.href = '/chats'
      toast.success(`Welcome, ${result?.user?.displayName}!`, {
        position: 'top-center',
        duration: 3000,
      })
    } catch (error) {
      console.error('Google login error:', error)
    }
  }

  useEffect(() => {
    if (user) {
      window.location.href = '/chat'
    }
  }, [user])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-[#212121] to-gray-800">
      <motion.header 
        className='fixed top-4 flex justify-center items-center gap-2'
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.img 
          src="/star.png" 
          alt="LowCode GPT Logo" 
          height={50} 
          width={50} 
          className='cursor-pointer'
          whileHover={{ scale: 1.1, rotate: 90 }}
          transition={{ duration: 0.3 }}
        />
        <h1 className='text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 max-md:text-3xl'>
          LowCode GPT
        </h1>
      </motion.header>

      <motion.div 
        className="flex flex-col items-center gap-8 p-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
       <h2 className='text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-blue-500 max-md:text-2xl'>
          Welcome to LowCode GPT
        </h2>
        <p className='text-xl text-gray-300 mb-4 text-center max-w-md'>
          Experience the power of AI-assisted development. 
          Login now to start building amazing projects faster than ever before.
        </p>
        <motion.button
          onClick={handleLogin}
          className="flex items-center justify-center px-6 py-3 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 ease-in-out max-md:text-[16px] max-md:px-3"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FcGoogle size={30} className="mr-3" />
          <span>Continue with Google</span>
        </motion.button>
      </motion.div>
      
      <motion.footer 
        className='fixed bottom-0 w-full p-3 bg-gradient-to-r from-gray-900 to-black'
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <p className='text-center text-sm text-gray-300'>
          Made with <span className='text-red-500'>&#10084;</span> by Sourav. 
          This App is powered by <span className='text-blue-400'>Gemini API</span>.
        </p>
      </motion.footer>
    </div>
  )
}