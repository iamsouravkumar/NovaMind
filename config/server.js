const express = require("express");
const admin = require("firebase-admin");
const dotenv = require("dotenv");
const axios = require("axios");
const path = require("path");
const API_KEY = process.env.VITE_GEMINI_API_KEY;
FIREBASE_KEY = process.env.FIREBASE_SERVICE_KEY
dotenv.config();

const app = express();
app.use(express.json());

// Initialize Firebase Admin
const serviceAccount = require("./service.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Endpoint to handle AI responses
app.post("/generate-response", async (req, res) => {
  const { prompt, chatId, userId } = req.body;

  try {
    const response = await axios.post(
      "https://api.generativeai.googleapis.com/v1/generate",
      {
        model: "gemini-1.5-flash",
        prompt,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GOOGLE_GEMINI_API_KEY}`,
        },
      }
    );

    const aiMessage = response.data.choices[0].message;

    // Store the AI response in Firebase
    await db.collection(`chats/${chatId}/messages`).add({
      text: aiMessage,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      senderId: "bot", // Identifying the AI message
    });

    res.status(200).json({ message: aiMessage });
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
