import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../../config/firebase';
import { collection, addDoc, doc, getDoc, Timestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Send } from 'lucide-react';
import axios from "axios";

const Chat = ({ selectedChat, setSelectedChat }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatTitle, setChatTitle] = useState('Untitled Chat'); // State for title

  const messagesEndRef = useRef(null);

  // Fetch chat messages when selectedChat changes
  useEffect(() => {
    if (selectedChat) {
      const q = query(collection(db, `chats/${selectedChat.id}/messages`), orderBy('timestamp'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      // Fetch the title for the selected chat
      const chatRef = doc(db, "chats", selectedChat.id);  // Correct way to reference a specific document
      getDoc(chatRef).then((docSnap) => {
        if (docSnap.exists()) {
          setChatTitle(docSnap.data().title || 'Untitled Chat');
        } else {
          setChatTitle('Untitled Chat');
        }
      });

      return () => unsubscribe();
    } else {
      setMessages([]);
      setChatTitle('Untitled Chat');
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  let aiResponse = '';

  const saveConversation = async (userId, userInput, aiResponse) => {

    try {
      await addDoc(collection(db, "conversations"), {
        userId,
        userInput,
        aiResponse,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error saving conversation:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    setLoading(true);
    const messageData = {
      text: input,
      timestamp: Timestamp.now(),
      senderId: auth?.currentUser?.uid,
    };

    try {
      if (selectedChat) {
        // Send the user message to Firestore
        await addDoc(collection(db, `chats/${selectedChat.id}/messages`), messageData);

        // Call backend API to get AI response
        const response = await axios.post("http://localhost:5000/generate-response", {
          userInput: input,
          userId: auth.currentUser.uid,
        });

        const aiResponse = response?.data?.aiResponse;

        // Store AI response in Firestore
        await addDoc(collection(db, `chats/${selectedChat.id}/messages`), {
          text: aiResponse,
          timestamp: Timestamp.now(),
          senderId: 'LowCodeGPT', // Mark AI as the sender
        });
      } else {
        // Create a new chat and add both user and AI messages
        const newChatRef = await addDoc(collection(db, 'chats'), {
          userId: auth.currentUser.uid,
          timestamp: Timestamp.now(),
          title: docSnap.data().title // Set the default title
        });

        await addDoc(collection(db, `chats/${newChatRef.id}/messages`), messageData);

        const response = await axios.post("http://localhost:5000/generate-response", {
          userInput: input,
          userId: auth.currentUser.uid,
        });
        
        const aiResponse = response?.data?.aiResponse;

        await addDoc(collection(db, `chats/${newChatRef.id}/messages`), {
          text: aiResponse,
          timestamp: Timestamp.now(),
          senderId: 'LowCodeGPT',
        });
      }

      saveConversation(auth?.currentUser?.uid, input, aiResponse);
      setInput(''); // Clear input after sending message
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-0 flex flex-col h-[100%] w-[80%] ml-[20%] dark:bg-gray-900">
      {/* Chat Header */}
      <div className="text-xl font-bold text-white p-4">
        {/* {chatTitle} */}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <h2 className="text-2xl text-white font-bold mb-4 text-gray-700 dark:text-gray-300">
                Welcome to LowCode GPT!
              </h2>
              <p className="text-gray-200 dark:text-gray-400 max-w-md">
                Start your conversation by typing a message below. What would you like to create today?
              </p>
            </motion.div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.senderId === auth.currentUser.uid ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[70%] ${msg.senderId === auth.currentUser.uid ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* <div className="w-9 h-9">
                    <img src={msg.senderId === auth.currentUser.uid ? auth.currentUser.photoURL : '/bot-avatar.png'} className='rounded-full' />
                    <div>{msg.senderId === auth.currentUser.uid ? 'U' : 'B'}</div>
                  </div> */}
                  <div className={`rounded-lg p-3 mx-14 my-8 ${msg.senderId === auth.currentUser.uid ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'}`}>
                    <p className="text-sm">{msg.text}</p>
                    {/* <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {msg.timestamp.toDate().toLocaleTimeString()}
                    </p> */}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="relative w-full max-w-4xl mx-auto mt-8 p-[3px] rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 animate-border-run">
        <form onSubmit={handleSendMessage} className="relative flex items-center bg-[#212121] rounded-full">
          <div className="relative flex-grow">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-500/10 to-indigo-400/10 animate-gradient-shift rounded-full"></div>
            <input
              type="text"
              placeholder="Message LowCode GPT..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-6 py-3 bg-transparent text-white placeholder-gray-200 focus:outline-none relative z-10"
            />
          </div>
          <button
            type="submit"
            disabled={loading || input.trim() === ''}
            className="m-1 p-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white transition-all duration-300 hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed relative z-10 mr-2"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
