import React, { useState, useEffect, useRef } from 'react'
import { db, auth } from '../../config/firebase'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { isToday, isYesterday, isThisWeek, isThisMonth, format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { BsLayoutSidebarInset, BsThreeDots } from "react-icons/bs"
import { useMediaQuery } from 'react-responsive'
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ setSelectedChat }) => {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(false)
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

  useEffect(() => {
    const user = auth.currentUser
    if (user) {
      const chatsRef = collection(db, 'chats')
      const q = query(
        chatsRef,
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const chatsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setChats(chatsData)
        setLoading(false)
      })

      return () => unsubscribe()
    }
  }, [])

  useEffect(() => {
    // Retrieve chat ID from URL on page load
    const chatIdFromUrl = new URLSearchParams(location.search).get('chatId');
    if (chatIdFromUrl) {
      setSelectedChatId(chatIdFromUrl);
      setSelectedChat(chatIdFromUrl); // Assuming setSelectedChat takes chat ID
    }
  }, [location.search]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleChatSelect = (chatId) => {
    setSelectedChatId(chatId);
    setSelectedChat(chatId);
    navigate(`?chatId=${chatId}`);
    if (isMobile) {
      setIsOpen(false)
    }
  }

  const ChatSkeleton = () => (
    <div className="animate-pulse flex items-center space-x-4 p-4 hover:bg-gray-800 rounded-lg">
      <div className="rounded-full bg-gray-700 h-10 w-10"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  )

  // Format the timestamp for display
  const formatTimestamp = (timestamp) => {
    if (isToday(timestamp)) return 'Today'
    if (isYesterday(timestamp)) return 'Yesterday'
    if (isThisWeek(timestamp)) return format(timestamp, "eeee")
    if (isThisMonth(timestamp)) return format(timestamp, "d MMM")
    return format(timestamp, "MMMM d, yyyy")
  }

  const handleModalToggle = (chatId, chatIndex) => {
    setSelectedChatId(chatId)
    setModalOpen(!modalOpen)

    // Get the position of the chat in the sidebar using getBoundingClientRect
    const chatElement = chatRefs.current[chatIndex]
    if (chatElement) {
      const { top, left, width } = chatElement.getBoundingClientRect()
      setModalPosition({ top: top + window.scrollY, left: left + width }) // Position modal to the right of the chat
    }
  }

  return (
    <div className="relative h-[100%] w-[20%] max-md:w-[95%]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ width: 0 }}
            transition={{ duration: 0.3 }}
            className="text-white h-screen w-full md:w-80 bg-[#171717] flex flex-col overflow-hidden md:relative z-50"
          >
            <div className="px-3 py-2 border-b border-gray-700 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <img src="star.png" alt="LowCode GPT Logo" height={30} width={30} />
                <h1 className="text-xl font-bold">LowCode GPT</h1>
              </div>
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-200">
                <BsLayoutSidebarInset className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div>
                  <ChatSkeleton />
                  <ChatSkeleton />
                  <ChatSkeleton />
                </div>
              ) : chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-center text-gray-500">No conversations yet, start a new chat!</p>
                </div>
              ) : (
                <ul className="space-y-2 p-4">
                  {chats.map((chat, index) => (
                    <motion.li 
                      key={chat?.id}
                      ref={(el) => chatRefs.current[index] = el} // Assign ref to each chat item
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => handleChatSelect(chat)}
                      className="cursor-pointer hover:bg-gray-800 p-3 rounded-lg transition-colors duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <h3 className="font-medium truncate">{chat.title || 'Untitled Chat'}</h3>
                          <p className="text-sm text-gray-400">
                            {chat.timestamp ? formatTimestamp(chat.timestamp.toDate()) : 'No date'}
                          </p>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleModalToggle(chat.id, index) }}
                          className="text-gray-400 hover:text-white"
                        >
                          <BsThreeDots className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for Chat Settings */}
      <AnimatePresence>
        {modalOpen && selectedChatId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bg-gray-800 text-gray-100 p-3 rounded-lg shadow-lg z-50 w-full w-[50%]"
            style={{ top: modalPosition.top, left: modalPosition.left }}
          >
            {/* <h3 className="font-bold text-lg">Chat Settings</h3> */}
            <div className="space-y-2">
              <button className="w-full text-left text-sm p-2 hover:bg-gray-700 rounded-lg">Change Title</button>
              <button className="w-full text-left text-sm p-2 hover:bg-gray-700 rounded-lg">Delete Chat</button>
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
          className="absolute top-4 left-4 p-2 bg-[#171717] text-white rounded-full hover:bg-gray-700 transition-colors duration-200 z-50"
        >
          <BsLayoutSidebarInset className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  )
}

export default Sidebar
