import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BsLayoutSidebarInset, BsThreeDots } from "react-icons/bs"
import { useMediaQuery } from 'react-responsive'
import { useNavigate, useLocation } from 'react-router-dom';
import { chatService } from '../services/chatService';
import { toast } from 'react-hot-toast';
import { isToday, isYesterday, isThisWeek, isThisMonth, format } from 'date-fns'
const starLogo = '../public/star.png'

const Sidebar = () => {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedChatId, setSelectedChatId] = useState(null)
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })
  const isMobile = useMediaQuery({ maxWidth: 768 })

  const chatRefs = useRef([]) // Array to store references to chat list items
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsOpen(!isMobile)
  }, [isMobile])

  // Subscribe to chats
  useEffect(() => {
    const unsubscribe = chatService.subscribeToChats((newChats) => {
      const sortedChats = newChats.sort((a, b) => 
        (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0)
      );
      setChats(sortedChats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

 const handleChatSelect = (chat) => {
    if (selectedChatId === chat.id) {
      // If the chat is already selected, close it
      navigate('/');
      if (isMobile) {
        setIsOpen(false);
      }
      setSelectedChatId(null);
    } else {
      // Otherwise, open the new chat
      setSelectedChatId(chat.id);
      navigate(`/chat/${chat.id}`);
      if (isMobile) {
        setIsOpen(false);
      }
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await chatService.deleteChat(chatId);
      setModalOpen(false);
      if (location.pathname.includes(chatId)) {
        navigate('/');
      }
      toast.success('Chat deleted');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete chat');
    }
  };

  const handleUpdateTitle = async (chatId, newTitle) => {
    try {
      await chatService.updateTitle(chatId, newTitle);
      setModalOpen(false);
      toast.success('Title updated');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update title');
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return '';
    const date = new Date(timestamp.seconds * 1000);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isThisWeek(date)) return format(date, "eeee");
    if (isThisMonth(date)) return format(date, "d MMM");
    return format(date, "MMMM d, yyyy");
  };

  
  const groupChatsByDate = (chats) => {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      thisMonth: [],
      older: []
    };

    chats.forEach(chat => {
      if (!chat.updatedAt || !chat.updatedAt.seconds) {
        return; // Skip chats without valid timestamps
      }
      const date = new Date(chat.updatedAt.seconds * 1000);
      if (isToday(date)) {
        groups.today.push(chat);
      } else if (isYesterday(date)) {
        groups.yesterday.push(chat);
      } else if (isThisWeek(date)) {
        groups.thisWeek.push(chat);
      } else if (isThisMonth(date)) {
        groups.thisMonth.push(chat);
      } else {
        groups.older.push(chat);
      }
    });

    return groups;
  };
    
    const handleModalToggle = (chatId, chatIndex) => {
    setSelectedChatId(chatId);
    setModalOpen(!modalOpen);

    const chatElement = chatRefs.current[chatIndex];
    if (chatElement) {
      const { top, left, width } = chatElement.getBoundingClientRect();
      setModalPosition({ top: top + window.scrollY, left: left + width });
    }
  };
  const ChatSkeleton = () => (
    <div className="animate-pulse flex items-center space-x-4 p-4 hover:bg-gray-800 rounded-lg mx-2">
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-700/50 rounded w-1/2"></div>
      </div>
      <div className="h-4 w-4 bg-gray-700 rounded"></div>
    </div>
  );
  const renderChatGroup = (chats, groupTitle) => {
    if (!chats || chats.length === 0) return null;
  

    return (
      <div className="mb-6">
        <div className="sticky top-0 z-10 backdrop-blur-sm">
          <h3 className="
            text-xs
            font-semibold
            uppercase
            tracking-wider
            px-4
            py-2
            mb-2
            text-gray-400
            border-b
            border-gray-800/50
            bg-gradient-to-r
            from-gray-900/50
            to-transparent
          ">
            {groupTitle}
            <span className="ml-2 text-gray-500 text-[10px]">({chats.length})</span>
          </h3>
        </div>
        <div className="space-y-1">
          {chats.map((chat, index) => (
            <motion.li 
              key={chat?.id}
              ref={(el) => chatRefs.current[index] = el}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleChatSelect(chat)}
              className={`cursor-pointer p-3 mx-2 rounded-lg transition-all duration-200 ease-in-out border-[1px] border-slate-500/30
                ${chat.id === selectedChatId ? 'bg-gray-800 shadow-lg  shadow-gray-900/20' : 'hover:bg-gray-800/70'}
              `}
            >
              <div className="flex items-center space-x-3">
                {/* {chat.id !== selectedChatId && ( // Show logo only for AI messages
                  <img src={starLogo} alt="LowCode GPT" height={20} width={20} className="mr-2" />
                )} */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate text-gray-200 ">
                    {chat.title || 'Untitled Chat'}
                  </h3>
                  {/* <p className="text-xs text-gray-500 mt-0.5">
                    {formatTimestamp(chat.updatedAt)}
                  </p> */}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleModalToggle(chat.id, index) }}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <BsThreeDots className="w-4 h-4" />
                </button>
              </div>
            </motion.li>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className=" h-[100%] w-[20%] max-md:w-[100%] ">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ width: 0 }}
            transition={{ duration: 0.3 }}
            className="text-white h-screen w-full md:w-80 bg-[#171717] flex flex-col overflow-hidden md:overflow-y-auto"
          >
            <div className="px-3 py-2 border-b border-gray-700 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <img src={starLogo} alt="LowCode GPT Logo" height={25} width={25} />
                <h1 className="text-lg font-bold max-md:">LowCode GPT</h1>
              </div>
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-200">
                <BsLayoutSidebarInset className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent z-[100]">
              {loading ? (
                <div className="space-y-4 p-4">
                  <ChatSkeleton/>
                  <ChatSkeleton/>
                  <ChatSkeleton/>
                </div>
              ) : chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-4 z-[100]">
                  <p className="text-center text-gray-500 animate-pulse">
                    No conversations yet, start a new chat!
                  </p>
                </div>
              ) : (
                <ul className="py-4 space-y-2">
                  {(() => {
                    const groups = groupChatsByDate(chats);
                    return (
                      <>
                        {renderChatGroup(groups.today, 'Today')}
                        {renderChatGroup(groups.yesterday, 'Yesterday')}
                        {renderChatGroup(groups.thisWeek, 'Previous 7 Days')}
                        {renderChatGroup(groups.thisMonth, 'This Month')}
                        {renderChatGroup(groups.older, 'Older')}
                      </>
                    );
                  })()}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalOpen && selectedChatId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bg-gray-800 text-gray-100 p-3 rounded-lg shadow-lg z-[100] w-[50%]"
            style={{ top: modalPosition.top, left: modalPosition.left }}
          >
            <div className="space-y-2">
              <button className="w-full text-left text-sm p-2 hover:bg-gray-700 rounded-lg">Change Title</button>
              <button className="w-full text-left text-sm p-2 hover:bg-gray-700 rounded-lg" onClick={() => handleDeleteChat(selectedChatId)}>Delete Chat</button>
              <button className="w-full text-left text-sm p-2 hover:bg-gray-700 rounded-lg" onClick={() => setModalOpen(false)}>Close</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={toggleSidebar}
          className="absolute top-4 left-4 p-2 bg-[#171717] text-white rounded-full hover:bg-gray-700 transition-colors duration-200 z-[100]"
        >
          <BsLayoutSidebarInset className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  )
}

export default Sidebar
