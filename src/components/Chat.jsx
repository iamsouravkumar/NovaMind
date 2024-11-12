import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Send } from 'lucide-react';
import { chatService } from '../services/chatService';
import { toast } from 'react-hot-toast';
import UserAvatar from './UserAvatar';
import ChatLoader from './ChatLoader';
const starLogo = '../public/star.png'

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(true);
  const { chatId } = useParams();
  const messagesEndRef = useRef(null);

  // Subscribe to messages for the current chat
  useEffect(() => {
    let unsubscribe;

    if (chatId) {
      setChatLoading(true);
      unsubscribe = chatService.subscribeToChats((chats) => {
        const currentChat = chats.find(chat => chat.id === chatId);
        if (currentChat) {
          setMessages(currentChat.messages || []);
          setChatLoading(false);
        }
      });
    } else {
      setMessages([]);
      setChatLoading(false);
    }

    return () => unsubscribe && unsubscribe();
  }, [chatId]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    try {
      if (chatId) {
        // Add message to existing chat
        await chatService.addMessage(chatId, userMessage);
      } else {
        // Create new chat
        await chatService.createChat(userMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setInput(userMessage); // Restore the input on error
    } finally {
      setLoading(false);
    }
  }
  
  // const ChatSkeleton = () => (
  //   <div className="animate-pulse flex items-center space-x-4 p-4 hover:bg-gray-800 rounded-lg mx-2">
  //     <div className="flex-1 space-y-3">
  //       <div className="h-4 bg-gray-700 rounded w-3/4"></div>
  //       <div className="h-3 bg-gray-700/50 rounded w-1/2"></div>
  //     </div>
  //     <div className="h-4 w-4 bg-gray-700 rounded"></div>
  //   </div>
  // );

  return (
    <div className="fixed top-0 flex flex-col h-[100%] w-[80%] ml-[20%] dark:bg-gray-900">
      {/* Chat Header with UserAvatar */}
      <div className="flex justify-end items-center text-xl font-bold text-white p-2">
        <UserAvatar />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence>
          {chatLoading ? (
            <div className="flex flex-col items-center justify-center h-full w-full">
              <ChatLoader />
            </div>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col justify-center h-full text-center"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-100 dark:text-gray-300 mx-auto">
                Welcome to LowCode GPT!
              </h2>
              <p className="text-gray-200 dark:text-gray-400 max-w-md mx-auto">
                Start your conversation by typing a message below. What would you like to create today?
              </p>
            </motion.div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[70%] ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className='flex items-center mx-6'> 
                  {message.role !== 'user' && ( // Show logo only for AI messages
                    <img src={starLogo} alt="LowCode GPT" height={35} width={35} className="" />
                  )}
                  <div className={`rounded-lg p-3 mx-3 my-4 ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}>
                    <div className='flex items-center justify-center'> 
                    <p className="text-sm whitespace-pre-wrap arial">{message.content}</p>
                    </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )) 
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="relative w-full max-w-4xl mx-auto mb-4 p-[3px] rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 animate-border-run">
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
