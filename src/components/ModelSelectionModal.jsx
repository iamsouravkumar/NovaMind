import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from "react-icons/fa6";

const ModelSelectionModal = ({ selectedModel, onSelectModel }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const models = [
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
        { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash-8B' },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
    ];

    return (
        <div className="relative">
            <motion.button
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
                onClick={() => setShowDropdown(!showDropdown)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <span className="text-white text-sm flex items-center gap-2 ">Model: {selectedModel} <FaChevronDown className={`${showDropdown ? 'transition-all duration-200 rotate-180' : ''}`} /></span>
            </motion.button>

            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-50"
                    >
                        <ul>
                            {models.map(model => (
                                <li key={model.id} className="mb-2">
                                    <button
                                        onClick={() => {
                                            onSelectModel(model.id);
                                            setShowDropdown(false); // Close dropdown after selection
                                        }}
                                        className="w-full text-left text-gray-100 p-2 rounded-full hover:bg-gray-700 transition-colors duration-200 text-sm"
                                    >
                                        {model.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ModelSelectionModal;
