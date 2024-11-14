import React, { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, getAuth } from 'firebase/auth';
import { auth } from '../config/firebase';
import { FcGoogle } from "react-icons/fc";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-hot-toast';
import { Mail } from 'lucide-react';

export default function AuthPage() {
    const [user, setUser] = useState(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            setUser(result.user);
            window.location.href = '/chats';
            toast.success(`Welcome, ${result?.user?.displayName}!`);
        } catch (error) {
            console.error('Google login error:', error);
            toast.error('Failed to login with Google');
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let result;
            if (isSignUp) {
                const signInMethods = await auth.fetchSignInMethodsForEmail(email);
                if (signInMethods.length > 0) {
                    throw new Error('Email already exists');
                }
                result = await createUserWithEmailAndPassword(auth, email, password);
                toast.success('Account created successfully!');
            } else {
                result = await signInWithEmailAndPassword(auth, email, password);
                toast.success('Welcome back!');
            }
            setUser(result.user);
            window.location.href = '/chats';
        } catch (error) {
            console.error('Email auth error:', error);
            toast.error(error.message === 'Email already exists' ? 'Email already exists' : 'Not a valid email or password');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            window.location.href = '/';
        }
    }, [user]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-[#212121] to-gray-800">
            {/* Header */}
            {/* <motion.header 
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
      </motion.header> */}

            {/* Main Content */}
            <motion.div
                className="flex flex-col items-center gap-8 p-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 max-md:w-[90%] max-md:p-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.h2
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className='text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 max-md:text-2xl'>
                    Welcome to LowCode GPT
                </motion.h2>

                <form onSubmit={handleEmailAuth} className="w-full space-y-4 mb-4">
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                        />
                    </div>
                    <motion.button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Mail className="mr-2 h-5 w-5" />
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
                    </motion.button>
                </form>

                <div className="flex items-center w-full my-4">
                    <div className="flex-1 border-t border-gray-600"></div>
                    <span className="px-4 text-gray-400">OR</span>
                    <div className="flex-1 border-t border-gray-600"></div>
                </div>

                <motion.button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <FcGoogle className="mr-2 h-6 w-6" />
                    Continue with Google
                </motion.button>

                <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                    {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                </button>
            </motion.div>

            {/* Footer */}
            <motion.footer
                className='fixed bottom-0 w-full p-3 bg-gradient-to-r from-gray-900 to-black max-md:p-1'
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <p className='text-center text-sm text-gray-300 max-md:text-xs'>
                    Made with <span className='text-red-500'>&#10084;</span> by Sourav.
                    This App is powered by <span className='text-blue-400'>Gemini API</span>.
                </p>
            </motion.footer>
        </div>
    );
} 