import React, { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, getAuth, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { toast } from 'react-hot-toast';
import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const starLogo = 'https://cdn-icons-png.flaticon.com/128/11618/11618860.png'

export default function AuthPage() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            setLoading(true);
            const result = await signInWithPopup(auth, provider);
            toast.success(`Welcome, ${result.user.displayName}!`);
            navigate('/');
        } catch (error) {
            console.error('Google login error:', error);
            toast.error('Failed to login with Google');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { email, password } = formData;

        try {
            let result;
            const authInstance = getAuth();
            if (isSignUp) {
                const signInMethods = await fetchSignInMethodsForEmail(authInstance, email);
                if (signInMethods.length > 0) throw new Error('Email already exists');
                result = await createUserWithEmailAndPassword(authInstance, email, password);
                toast.success('Account created successfully!');
            } else {
                result = await signInWithEmailAndPassword(authInstance, email, password);
                toast.success('Welcome back!');
            }
            navigate('/');
        } catch (error) {
            console.error('Email auth error:', error);
            toast.error(error.message === 'Email already exists' ? 'Email already exists' : 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Redirect if user is logged in
        if (auth.currentUser) {
            navigate('/');
        }
    }, [navigate]);

    const ImgLoader = () => (
         <img src={starLogo} alt="Loading" className='w-20 h-20 animate-spin'/>
    )

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-[#212121] to-gray-800">
            {loading && <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"><ImgLoader/></div>}
            <motion.div className="flex flex-col items-center gap-6 p-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 max-md:w-[90%] max-md:p-4">
                <motion.h2 className='text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 max-md:text-2xl'>Welcome to LowCode GPT</motion.h2>
                <form onSubmit={handleEmailAuth} className="w-full space-y-4 mb-4">
                    <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg" required />
                    <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg" required />
                    <motion.button type="submit" disabled={loading} className="w-full flex items-center justify-center px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50">
                        <Mail className="mr-2 h-5 w-5" />
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
                    </motion.button>
                </form>
                <div className="flex items-center w-full my-4">
                    <div className="flex-1 border-t border-gray-600"></div>
                    <span className="px-4 text-gray-400">OR</span>
                    <div className="flex-1 border-t border-gray-600"></div>
                </div>
                <motion.button onClick={handleGoogleLogin} className="w-full flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-300">
                    <FcGoogle className="mr-2 h-6 w-6" />
                    Continue with Google
                </motion.button>
                <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                </button>
                <button onClick={() => navigate('/about')} className="text-sm text-gray-400 hover:text-white transition-colors">About Us</button>
            </motion.div>
            <motion.footer className='fixed bottom-0 w-full p-3 bg-gradient-to-r from-gray-900 to-black max-md:p-1'>
                <p className='text-center text-sm text-gray-300 max-md:text-xs'>Made with <span className='text-red-500'>&#10084;</span> by <a href="https://github.com/iamsouravkumar" referrerPolicy="no-referrer" target="_blank" className='text-blue-400 hover:underline'>Sourav.</a> This App is powered by <span className='text-blue-400'>Gemini API</span>.</p>
            </motion.footer>
        </div>
    );
} 