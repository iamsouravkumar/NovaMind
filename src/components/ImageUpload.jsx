import React, { useState } from 'react';
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the file manager and AI model
const fileManager = new GoogleAIFileManager(import.meta.VITE_GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(import.meta.VITE_GEMINI_API_KEY);

const ImageUpload = ({ onImageUpload }) => {
    const [file, setFile] = useState(null);
    const [prompt, setPrompt] = useState('');

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handlePromptChange = (event) => {
        setPrompt(event.target.value);
    };

    const handleUpload = async () => {
        if (file && prompt) {
            try {
                // Upload the file
                const uploadResult = await fileManager.uploadFile(file, {
                    mimeType: file.type,
                    displayName: file.name,
                });

                console.log(`Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`);

                // Generate content based on the uploaded image and prompt
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent([
                    prompt,
                    {
                        fileData: {
                            fileUri: uploadResult.file.uri,
                            mimeType: uploadResult.file.mimeType,
                        },
                    },
                ]);

                console.log(result.response.text());
                onImageUpload(uploadResult.file, prompt); // Pass the uploaded file and prompt to the parent component
                setFile(null); // Reset file input
                setPrompt(''); // Reset prompt input
            } catch (error) {
                console.error('Error uploading image or generating content:', error);
            }
        }
    };

    return (
        <div className="flex flex-col">
            <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="mb-2"
            />
            <input
                type="text"
                placeholder="Enter your prompt..."
                value={prompt}
                onChange={handlePromptChange}
                className="mb-2 px-2 py-1 border rounded"
            />
            {/* The button will be handled in Chat.jsx */}
            <button 
                type="button" 
                onClick={handleUpload} 
                className="mt-2 p-2 bg-blue-500 text-white rounded"
            >
                Upload Image
            </button>
        </div>
    );
};

export default ImageUpload;
