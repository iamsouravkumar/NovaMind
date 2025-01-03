import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BsLayoutSidebarInset, BsThreeDots, BsPencil, BsTrash, BsXLg } from "react-icons/bs"
import { useMediaQuery } from 'react-responsive'
import { useNavigate, useLocation } from 'react-router-dom';
import { chatService } from '../services/chatService';
import { toast } from 'react-hot-toast';
import { isToday, isYesterday, isThisWeek, isThisMonth, format } from 'date-fns'
const starLogo = './gpt.png'

const Sidebar = ({ onToggle }) => {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedChatId, setSelectedChatId] = useState(null)
  const [isOpen, setIsOpen] = useState('lg:w-[20%] max-md:w-[25%] lg:hidden') //for mobile nd chat select
  const [modalOpen, setModalOpen] = useState(false)
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })
  const [editTitleModalOpen, setEditTitleModalOpen] = useState(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [newTitle, setNewTitle] = useState('');

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
    onToggle(!isOpen)
  }

  const handleChatSelect = (chat) => {
    if (selectedChatId === chat.id) {
      // If the chat is already selected, close it
      navigate('/');
      document.title = 'NovaMind';
      if (isMobile) {
        setIsOpen(false);
      }
      setSelectedChatId(null);
    } else {
      // Otherwise, open the new chat
      setSelectedChatId(chat.id);
      navigate(`/chat/${chat.id}`);
      document.title = chat.title.length > 0 ? chat.title.slice(0, 30) : 'NovaMind';
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
        if (isMobile) {
          setIsOpen(false);
        }
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
      if (isMobile) {
        setIsOpen(false);
      }
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

  const handleModalToggle = (chatId, index) => {
    const chatElement = chatRefs.current[index];
    if (chatElement) {
      const { top, left, height, width } = chatElement.getBoundingClientRect();
      const isMobile = window.innerWidth < 768; // Check if the device is mobile
      const modalWidth = 200; // Set a fixed width for the modal (adjust as needed)

      // Set modal position below the chat item
      const newTop = top + window.scrollY + height;
      let newLeft = left + width; // Default to right of the chat item

      // Adjust for mobile devices to keep the modal in view
      if (isMobile) {
        const rightEdge = left + width + modalWidth; // Calculate right edge of the modal
        const viewportWidth = window.innerWidth;

        // If the modal goes out of the viewport, adjust its position
        if (rightEdge > viewportWidth) {
          newLeft = viewportWidth - modalWidth; // Position it to the far right within the viewport
        }
      }

      setModalPosition({ top: newTop, left: newLeft });
    }
    setModalOpen(true);
    setSelectedChatId(chatId);
  };

  const handleEditTitleClick = (chatId, currentTitle) => {
    setEditingChatId(chatId);
    setNewTitle(currentTitle);
    setEditTitleModalOpen(true);
    setModalOpen(false);
  };

  const handleTitleSubmit = (e) => {
    e.preventDefault();
    handleUpdateTitle(editingChatId, newTitle);
    setEditTitleModalOpen(false);
  };

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
            text-[#8A00FF]
            border-b
            border-gray-800/50
            
          ">
            {groupTitle}
            {/* <span className="ml-2 text-gray-100 text-[10px]">({chats.length})</span> */}
          </h3>
        </div>
        <div className="space-y-1">
          {chats.map((chat, index) => (
            <motion.li
              key={chat?.id}
              ref={(el) => chatRefs.current[index] = el}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1 }}
              onClick={() => handleChatSelect(chat)}
              className={`cursor-pointer p-3 mx-2 rounded-lg transition-all duration-200 ease-in-out border border-slate-500/30 text-ellipsis line-clamp-1
                ${chat.id === selectedChatId ? 'bg-gray-800 shadow-lg shadow-gray-900/20 border-[#8700FF]' : 'hover:bg-gray-800/70'}
              `}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate text-gray-200">
                    {chat.title || 'Untitled Chat'}
                  </h3>
                </div>
                <button

                // className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <BsThreeDots className="w-5 h-5" onClick={(e) => { e.stopPropagation(); handleModalToggle(chat.id, index) }} />
                </button>
              </div>
            </motion.li>
          ))}
        </div>
      </div>
    );
  };

  const ChatSkeleton = () => (
    <div className="animate-pulse flex space-x-4 p-4">
      <div className="rounded-full bg-gray-700 h-10 w-10"></div>
      <div className="flex-1 space-y-6 py-1">
        <div className="h-2 bg-gray-700 rounded"></div>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div className="h-2 bg-gray-700 rounded col-span-2"></div>
            <div className="h-2 bg-gray-700 rounded col-span-1"></div>
          </div>
          <div className="h-2 bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`h-full w-full md:w-[25%] lg:w-[20%] relative ${isOpen ? 'border-r-[1px] border-slate-500/30' : ''} `}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ width: 0 }}
            transition={{ duration: 0.1, ease: 'easeInOut' }}
            className="text-white h-screen w-full md:w-80 bg-[#171717] flex flex-col overflow-hidden fixed top-0 left-0 z-50 md:relative md:z-auto"
          >
            <div className="px-3 py-2 border-b border-gray-700 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <img src={starLogo} alt="NovaMind Logo" className="h-6 w-6" />
                <h1 className="text-xl max-md:text-lg font-semibold transition-all duration-200 ease-in-out"><a href="https://iamsouravkumar.github.io/NovaMind/" className="text-gray-100 tracking-wider">NovaMind</a></h1>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-full hover:bg-gray-700 max-md:hover:bg-[#171717] transition-colors duration-200"
              >
                <BsLayoutSidebarInset className={`w-6 h-6 ${!isOpen ? '' : 'rotate-180'} max-md:w-5 max-md:h-5`} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
              {loading ? (
                <div className="space-y-1 p-2">
                  <ChatSkeleton />
                  <ChatSkeleton />
                  <ChatSkeleton />
                </div>
              ) : chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-4">
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
                        {renderChatGroup(groups.thisWeek, '7 Days Ago')}
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
            transition={{ duration: 0.2 }}
            className="fixed bg-[#171717] shadow-md shadow-black text-gray-100 p-3 rounded-lg z-[60] w-48 md:w-64 max-md:mt-1"
            style={{
              top: modalPosition.top,
              left: modalPosition.left,
              transform: modalPosition.transform
            }}
          >
            <div className="space-y-2">
              <button
                className="w-full text-left text-sm p-2 hover:bg-gray-700 rounded-lg"
                onClick={() => handleEditTitleClick(selectedChatId, chats.find(chat => chat.id === selectedChatId)?.title || '')}
              >
                <p className="flex items-center gap-2"><BsPencil size={15} className='text-blue-500' /> Change Title </p>
              </button>
              <button className="w-full text-left text-sm p-2 hover:bg-gray-700 rounded-lg" onClick={() => handleDeleteChat(selectedChatId)}><p className='flex items-center gap-2'><BsTrash size={15} className='text-red-500' /> Delete Chat</p></button>
              <button className="w-full text-left text-sm p-2 hover:bg-gray-700 rounded-lg" onClick={() => setModalOpen(false)}><p className='flex items-center gap-2'><BsXLg size={15} className='text-orange-500' /> Close</p></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editTitleModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]"
          >
            <div className="bg-[#171717] p-6 rounded-lg w-80">
              <h2 className="text-xl font-bold mb-4 text-white text-center">Edit Chat Title</h2>
              <form onSubmit={handleTitleSubmit}>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 mb-4 border-b bg-[#171717] border-[#D700FF] shadow-sm shadow-black text-white rounded"
                  placeholder="Enter new title"
                />
                <div className="flex justify-between space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditTitleModalOpen(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={toggleSidebar}
          className="fixed top-[8px] left-4 p-2 bg-[#171717] text-white rounded-full hover:bg-gray-700 transition-colors duration-200 z-50"
        >
          <BsLayoutSidebarInset className="w-6 h-6" />
        </motion.button>
      )}
      <div className={`fixed bottom-1 w-full text-xs text-gray-400 text-center mb-1 lg:hidden md:hidden transition-all ease-in-out duration-1000 ${!isOpen ? 'hidden' : 'z-50'}`}><p className='text-center'>NovaMind can make mistakes and is not guaranteed to be 100% accurate.</p></div>
    </div>
  );
};

export default Sidebar;