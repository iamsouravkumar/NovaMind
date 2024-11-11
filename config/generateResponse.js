const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // Store this securely
const GEMINI_API_URL = 'https://api.gemini.com/v1/generate'; // Replace with actual Gemini API endpoint

// Function to trigger when a new message is added
exports.generateResponse = functions.firestore
  .document('chats/{chatId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    const messageData = snapshot.data();
    const messageText = messageData.text;

    try {
      // Call the Gemini API to generate a response
      const response = await axios.post(GEMINI_API_URL, {
        prompt: messageText,
        key: GEMINI_API_KEY, // Add any necessary parameters for Gemini
      });

      // Get the generated response text
      const generatedText = response.data.generated_text;

      // Add the generated response to Firestore in the same chat
      await admin.firestore().collection('chats')
        .doc(context.params.chatId)
        .collection('messages')
        .add({
          text: generatedText,
          senderId: 'bot', // Indicating the bot sent this
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log('Message generated and saved:', generatedText);
    } catch (error) {
      console.error('Error generating response:', error);
    }
  });
