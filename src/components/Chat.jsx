// src/Chat.js
import React, { useState } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import generateResponse from '../config/generateResponse';

const Chat = ({ user }) => {
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState([]);

  const handleSendMessage = async () => {
    if (!message) return;

    // Get response from Gemini API
    const gptResponse = await generateResponse(message);

    // Store the message and response in Firestore
    if (gptResponse) {
      const docRef = await addDoc(collection(db, 'chats'), {
        userMessage: message,
        gptResponse: gptResponse.response,
        timestamp: serverTimestamp(),
        userId: user.uid,
      });

      // Update local state with the new message and response
      setResponses([...responses, { userMessage: message, gptResponse: gptResponse.response }]);

      // Clear the input field
      setMessage('');
    }
  };

  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask something..."
      />
      <button onClick={handleSendMessage}>Send</button>

      <div>
        {responses.map((resp, index) => (
          <div key={index}>
            <p><strong>You:</strong> {resp.userMessage}</p>
            <p><strong>GPT:</strong> {resp.gptResponse}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chat;