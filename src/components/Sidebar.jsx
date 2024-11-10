import React, { useEffect, useState } from 'react'
import { db, auth } from '../config/firebase'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { BsLayoutSidebarInset } from "react-icons/bs";
import { useMediaQuery } from 'react-responsive'

const Sidebar = ({ setSelectedChat }) => {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(true)
  const isMobile = useMediaQuery({ maxWidth: 768 })

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

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleChatSelect = (chat) => {
    setSelectedChat(chat)
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
                
                <img src="star.png" alt="LowCode GPT Logo" height={30} width={30}/>
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
                  {/* <MessageSquare className="w-12 h-12 text-gray-500 mb-4" /> */}
                  <p className="text-center text-gray-500">No conversations yet, start a new chat!</p>
                </div>
              ) : (
                <ul className="space-y-2 p-4">
                  {chats.map((chat) => (
                    <motion.li 
                      key={chat.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => setSelectedChat(chat)}
                      className="cursor-pointer hover:bg-gray-800 p-3 rounded-lg transition-colors duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                          
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium truncate">{chat.title || 'Untitled Chat'}</h3>
                          <p className="text-sm text-gray-400">
                            {chat.timestamp ? format(chat.timestamp.toDate(), "p, MMM d") : 'No date'}
                          </p>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
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