import React from 'react';
import { motion } from 'framer-motion';
import { Zap, MessageSquare, Brain, Lock, Sparkles, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
};

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

const features = [
    { icon: Zap, title: "Lightning Fast", description: "Get instant responses to your queries" },
    { icon: MessageSquare, title: "Natural Language", description: "Communicate in plain language, just like chatting with a friend" },
    { icon: Brain, title: "Multi-Domain Knowledge", description: "From coding to creative writing, our AI has you covered" },
    { icon: Lock, title: "Secure & Private", description: "Your data and conversations are always protected" },
    { icon: Sparkles, title: "Creative Assistant", description: "Generate ideas, stories, and content with ease" },
    { icon: Palette, title: "Versatile Helper", description: "Tackle a wide range of tasks across various domains" }
];

export default function AboutUs() {

    const navigate = useNavigate()

    const handleBtnClick = () => {
        navigate('/login');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#212121] to-[#121212] text-white">
            <header className="container mx-auto px-4 py-12 md:py-16 text-center">
                <motion.h1
                    className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 "
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    Welcome to NovaMind
                </motion.h1>
                <motion.p
                    className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 md:mb-8"
                    {...fadeIn}
                >
                    Your intelligent companion for any task
                </motion.p>
            </header>

            <main className="container mx-auto px-4">
                <motion.section
                    className="mb-12 md:mb-16"
                    variants={stagger}
                    initial="initial"
                    animate="animate"
                >
                    <h2 className="text-2xl md:text-3xl font-semibold mb-6 md:mb-8 text-center text-gray-200">Key Features</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="bg-gray-800 p-6 rounded-lg shadow-lg transform transition duration-300 hover:scale-105 border border-pink-500"
                                variants={fadeIn}
                                whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" }}
                            >
                                <motion.div
                                    initial={{ scale: 1 }}
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <feature.icon className="w-12 h-12 mb-4 text-blue-400" />
                                </motion.div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-200">{feature.title}</h3>
                                <p className="text-gray-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                <motion.section
                    className="mb-12 md:mb-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <h2 className="text-2xl md:text-3xl font-semibold mb-6 md:mb-8 text-center ">Our Technology</h2>
                    <motion.div
                        className="bg-gray-800  p-6 md:p-8 rounded-lg shadow-lg border border-pink-500"
                        whileHover={{ boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" }}
                    >
                        <p className="text-base md:text-lg mb-4 text-gray-300">
                            Our AI Assistant harnesses the power of advanced language models and machine learning algorithms to understand your needs and generate accurate, helpful responses across a wide range of topics and tasks.
                        </p>
                        <p className="text-base md:text-lg mb-4 text-gray-300">
                            Trained on vast amounts of diverse data, our AI can assist you with everything from coding and data analysis to creative writing and problem-solving. It's designed to be your go-to companion for any intellectual or creative challenge.
                        </p>
                        <p className="text-base md:text-lg text-gray-300">
                            With continuous learning and updates, our AI Assistant stays current with the latest information and trends, ensuring you always have access to cutting-edge assistance for your projects and queries.
                        </p>
                    </motion.div>
                </motion.section>

                <motion.section
                    className="mb-12 md:mb-12 text-center"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <h2 className="text-2xl md:text-3xl font-semibold mb-6 md:mb-8 text-gray-200">Ready to Enhance Your Productivity?</h2>
                    <motion.button
                        onClick={handleBtnClick}
                        className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
                        whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)" }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Get Started Now
                    </motion.button>
                </motion.section>
            </main>

            <footer className="bg-black py-6 md:py-4 text-center">
                <p className="text-gray-200">&copy; 2024 NovaMind. All rights reserved.</p>
            </footer>
        </div>
    );
}