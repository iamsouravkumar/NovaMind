import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Image, FileText, HelpCircle, Zap, Palette, Lightbulb, Cpu, Globe, Rocket, Music, Book } from 'lucide-react';

const predefinedPrompts = [
  { text: "Code", icon: Code, prompt: "Write a function to...", image: "/placeholder.svg?height=40&width=40" },
  { text: "Image", icon: Image, prompt: "Create an image of...", image: "/placeholder.svg?height=40&width=40" },
  { text: "Summarize", icon: FileText, prompt: "Summarize the following...", image: "/placeholder.svg?height=40&width=40" },
  { text: "Help", icon: HelpCircle, prompt: "How do I...", image: "/placeholder.svg?height=40&width=40" },
  { text: "Idea", icon: Lightbulb, prompt: "Give me an idea for...", image: "/placeholder.svg?height=40&width=40" },
  { text: "Design", icon: Palette, prompt: "Design a logo for...", image: "/placeholder.svg?height=40&width=40" },
  { text: "Explain", icon: Zap, prompt: "Explain the concept of...", image: "/placeholder.svg?height=40&width=40" },
  { text: "Tech", icon: Cpu, prompt: "What's new in...", image: "/placeholder.svg?height=40&width=40" },
  { text: "Travel", icon: Globe, prompt: "Plan a trip to...", image: "/placeholder.svg?height=40&width=40" },
  { text: "Science", icon: Rocket, prompt: "Explain the theory of...", image: "/placeholder.svg?height=40&width=40" },
  { text: "Music", icon: Music, prompt: "Compose a melody for...", image: "/placeholder.svg?height=40&width=40" },
  { text: "Literature", icon: Book, prompt: "Analyze the theme of...", image: "/placeholder.svg?height=40&width=40" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 10,
    },
  },
};

export default function PredefinedPrompts({ onPromptSelect }) {
  return (
    <div className="w-full py-4 px-2">
      <motion.div 
        className="flex flex-wrap justify-center gap-2 md:gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {predefinedPrompts.map((prompt, index) => (
            <motion.button
              key={index}
              variants={itemVariants}
              onClick={() => onPromptSelect(prompt.prompt)}
              className="flex flex-col items-center justify-center p-2 bg-gray-800 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-[calc(25%-0.5rem)] md:w-auto"
              whileHover={{ scale: 1.05, backgroundColor: '#374151' }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="w-10 h-10 mb-1 relative"
                whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}
              >
                <img
                  src={prompt.image}
                  alt={prompt.text}
                  className="w-full h-full object-cover rounded md:hidden"
                />
                <prompt.icon className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:block" />
              </motion.div>
              <span className="text-xs text-gray-300 whitespace-nowrap">{prompt.text}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}