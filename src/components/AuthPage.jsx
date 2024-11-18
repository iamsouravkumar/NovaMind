import React, { useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, getAuth, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { FcGoogle } from "react-icons/fc";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-hot-toast';
import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const starLogo = './gpt.png'

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
            if (result.user) {
                toast.success(`Welcome, ${result.user.displayName}!`);
                navigate('/');
            } else {
                throw new Error('Authentication failed. Please try again.');
            }
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

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 }
    };

    const pageTransition = {
        type: "tween",
        ease: "anticipate",
        duration: 0.5
    };

    const inputVariants = {
        focus: { scale: 1.05, transition: { duration: 0.2 } },
        blur: { scale: 1, transition: { duration: 0.2 } }
    };

    const buttonVariants = {
        hover: { scale: 1.05, transition: { duration: 0.1 } },
        tap: { scale: 0.95, transition: { duration: 0.1 } }
    };

    return (
        <motion.div 
            className="flex flex-col fixed top-0 bottom-0 left-0 right-0 items-center justify-center bg-[#212121] max-h-[100%]"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
        >
            <AnimatePresence>
                {loading && (
                    <motion.div 
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <ImgLoader/>
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.div 
                className="flex flex-col items-center gap-6 p-8 rounded-2xl shadow-md shadow-black max-md:w-[90%] max-md:p-5"
                variants={pageVariants}
                transition={pageTransition}
            >
                <motion.h2 
                    className='text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D700FF] to-[#8A00FF] max-md:text-2xl'
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    Welcome to NovaMind
                </motion.h2>
                <form onSubmit={handleEmailAuth} className="w-full space-y-4">
                    <motion.input 
                        type="email" 
                        placeholder="Email" 
                        value={formData.email} 
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                        className="w-full px-4 py-2 bg-transparent border-b border-[#8A00FF] shadow-sm shadow-black focus:outline-none focus:ring-1 focus:ring-[#D700FF] text-white rounded-lg" 
                        required 
                        variants={inputVariants}
                        whileFocus="focus"
                        whileBlur="blur"
                    />
                    <motion.input 
                        type="password" 
                        placeholder="Password" 
                        value={formData.password} 
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                        className="w-full px-4 py-2 bg-transparent border-b border-[#8A00FF] shadow-sm shadow-black focus:outline-none focus:ring-1 focus:ring-[#D700FF] text-white rounded-lg" 
                        required 
                        variants={inputVariants}
                        whileFocus="focus"
                        whileBlur="blur"
                    />
                    <motion.button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full flex items-center justify-center px-6 py-2 bg-gradient-to-r from-[#8A00FF] to-[#D700FF] text-white font-semibold rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
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
                    className="w-full flex items-center justify-center px-6 py-2 bg-gradient-to-r from-[#8A00FF] to-[#D700FF] text-white font-semibold rounded-lg shadow-lg transition-all duration-300"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                >
                    <FcGoogle className="mr-2 h-6 w-6" />
                    Continue with Google
                </motion.button>
                <motion.button 
                    onClick={() => setIsSignUp(!isSignUp)} 
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                </motion.button>
                <motion.button 
                    onClick={() => navigate('/about')} 
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    About Us
                </motion.button>
            </motion.div>
            <motion.footer 
                className='fixed bottom-0 w-full p-3 border-t border-[#8A00FF] bg-[#212121] max-md:p-1'
                initial={{ y: 20, opacity: 0 }}
                animate={{opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
            >
                <p className='text-center text-sm text-gray-300 max-md:text-xs mb-4 max-md:mb-5'>
                    Made with <span className='text-red-500'>&#10084;</span> by <a href="https://github.com/iamsouravkumar" referrerPolicy="no-referrer" target="_blank" className='text-blue-400 hover:underline'>Sourav.</a> NovaMind &copy; 2024. All rights reserved.
                </p>
            </motion.footer>
        </motion.div>
    );
}