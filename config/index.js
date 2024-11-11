const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");
require("dotenv").config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert('./service.json'),
})

const app = express();
app.use(express.json());

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

const genAI = new GoogleGenerativeAI('AIzaSyDjSmHW_s34T_wlyeJEgrauhk8t5vNCG6Y'); // Use your Gemini API key
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Endpoint to generate AI responses and store chat history
app.post("/generate-response", async (req, res) => {
  const { userInput, userId } = req.body; // Get user input and ID from the request body

  try {
    // Generate response using Gemini API
    const result = await model.generateContent(userInput);
    const aiResponse = result.response.text(); // Get the text response from Gemini

    // Store the conversation in Firestore
    // await admin.firestore().collection("chats").add({
    //   userId,
    //   userInput,
    //   aiResponse,
    //   timestamp: admin.firestore.FieldValue.serverTimestamp(),
    // });

    // Send the AI response back to the frontend
    res.json({ aiResponse });
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).send("Internal Server Error");
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
