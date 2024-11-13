import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Send } from 'lucide-react';
import { chatService } from '../services/chatService';
import { toast } from 'react-hot-toast';
import UserAvatar from './UserAvatar';
import ChatLoader from './ChatLoader';
import ModelSelectionModal from './ModelSelectionModal';
const starLogo = '../public/star.png'
import '../App.css'

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(true);
  const { chatId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-pro');

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
    setLoading(true); // Set loading to true immediately
    setMsgLoading(true); // Set msgLoading to true for the bot's response

    // Immediately add the user's message to the chat
    const newMessage = {
      content: userMessage,
      role: 'user',
    };

    // Update messages state with the new user message
    setMessages(prevMessages => [...prevMessages, newMessage]);

    // Use setTimeout to delay showing the bot's placeholder
    setTimeout(() => {
      // Add a placeholder for the bot's response after a delay
      const botPlaceholder = {
        content: "AI is thinking...",
        role: 'assistant',
        loading: true, // Indicate that this message is loading
      };
      setMessages(prevMessages => [...prevMessages, botPlaceholder]);
    }, 300); // Adjust the delay as needed (e.g., 500 milliseconds)

    try {
      let newChatId;

      if (chatId) {
        // Add message to existing chat
        await chatService.addMessage(chatId, userMessage, selectedModel); // Pass the selected model
      } else {
        // Create new chat and get the new chat ID
        newChatId = await chatService.createChat(userMessage, selectedModel); // Pass the selected model
        navigate(`/chat/${newChatId}`); // Redirect to the new chat
      }

      // Use the existing generateResponse function to get the bot's response
      const botResponse = await chatService.generateResponse(userMessage, selectedModel); // Pass the selected model

      // Update the messages state with the actual bot response
      setMessages(prevMessages => {
        // Replace the loader with the actual response
        return prevMessages.map(msg =>
          msg.loading ? { content: botResponse, role: 'assistant' } : msg
        );
      });

    } catch (error) {
      console.error('Error sending message:', error);
      if (error.message.includes('blocked due to safety')) {
        toast.error('Your message was blocked due to safety concerns. Please try rephrasing it.'); // User-friendly message
      } else if (error.message.includes('Candidate was blocked due to RECITATION')) {
        toast.error('Your message was blocked due to recitation concerns. Please try rephrasing it.');
      } else {
        toast.error('Failed to send message');
      }
      setInput(userMessage); // Restore the input on error
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const formatMessageContent = (content) => {
    // Replace **bold text** with <strong>bold text</strong>
    const boldTextRegex = /\*\*(.*?)\*\*/g; // Matches **text**
    const codeTextRegex = /`([^`]+)`/g; // Matches `code`

    return content
        .replace(boldTextRegex, '<strong>$1</strong>') // Replace bold text
        .replace(codeTextRegex, '<pre class="bg-gray-200 p-2 rounded"><code>$1</code></pre>'); // Replace code text
  };

  return (
    <div className="fixed top-0 flex flex-col h-[100%] w-[80%] ml-[20%] dark:bg-gray-900 max-md:w-[100%] max-md:ml-0">
      <div className="flex justify-between items-center p-3 max-md:ml-24">
        <div>
          <ModelSelectionModal
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
          />
        </div>
        <div className="flex items-center text-xl font-bold text-white">
          <UserAvatar />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-md">
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
              className="flex flex-col justify-center h-full text-center max-md:mx-auto"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-100 dark:text-gray-300 mx-auto max-md:text-xl">
                Welcome to LowCode GPT!
              </h2>
              <p className="text-gray-200 dark:text-gray-400 max-w-md mx-auto max-md:text-sm max-md:px-4">
                Start your conversation by typing a message below. What would you like to create today?
              </p>
            </motion.div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={`${message.role}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[70%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className='flex flex-row my-4'>
                    {message.role !== 'user' && ( // Show logo only for AI messages
                      <div><img src={starLogo} alt="LowCode GPT" height={35} width={35} className="" /></div>
                    )}
                    <div className={`rounded-lg p-3 mx-3 ${message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }`}>
                      <div className='flex'>
                        <p className="text-sm whitespace-pre-wrap arial" dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }} />
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

      <div className="relative w-full max-w-4xl mx-auto mb-4 p-[3px] rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 animate-border-run max-md:w-[90%]">
        <form onSubmit={handleSendMessage} className="relative flex items-center bg-[#212121] rounded-full">
          <div className="relative flex-grow ">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-500/10 to-indigo-400/10 animate-gradient-shift rounded-full"></div>
            <input
              type="text"
              placeholder="Message LowCode GPT..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-6 py-3 bg-transparent text-white placeholder-gray-100 focus:outline-none relative z-10 max-md:placeholder:text-sm"
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
