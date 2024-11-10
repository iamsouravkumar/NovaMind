import React, { useState, useEffect, useRef } from 'react'
import { db, auth } from '../config/firebase'
import { collection, addDoc, Timestamp, query, orderBy, onSnapshot } from 'firebase/firestore'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Send } from 'lucide-react';

const Chat = ({ selectedChat }) => {

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (selectedChat) {
      const q = query(collection(db, `chats/${selectedChat.id}/messages`), orderBy('timestamp'))
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      })
      return () => unsubscribe()
    } else {
      setMessages([])
    }
  }, [selectedChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (input.trim() === '') return

    setLoading(true)
    const messageData = {
      text: input,
      timestamp: Timestamp.now(),
      senderId: auth.currentUser.uid,
    }

    try {
      if (selectedChat) {
        await addDoc(collection(db, `chats/${selectedChat.id}/messages`), messageData)
      } else {
        const newChatRef = await addDoc(collection(db, 'chats'), {
          userId: auth.currentUser.uid,
          timestamp: Timestamp.now(),
        })
        await addDoc(collection(db, `chats/${newChatRef.id}/messages`), messageData)
      }
      setInput('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  return (

    <div className="fixed top-0 flex flex-col h-[100%] w-[80%] ml-[20%] dark:bg-gray-900">
      {/* <div className='flex justify-end px-4 py-3 cursor-pointer'>
        <Avatar className="w-8 h-8">
          <AvatarImage src={auth.currentUser.photoURL} />
          <AvatarFallback>{auth.currentUser.displayName[0]}</AvatarFallback>
        </Avatar>
        </div> */}
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
              messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.senderId === auth.currentUser.uid ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[70%] ${msg.senderId === auth.currentUser.uid ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={msg.senderId === auth.currentUser.uid ? auth.currentUser.photoURL : '/bot-avatar.png'} />
                      <AvatarFallback>{msg.senderId === auth.currentUser.uid ? 'U' : 'B'}</AvatarFallback>
                    </Avatar>
                    <div className={`rounded-lg p-3 ${msg.senderId === auth.currentUser.uid ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'}`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {msg.timestamp.toDate().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="p-4 ">
          <div className="flex items-center ">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message LowCode GPT..."
              className="px-4 py-4 w-[80%] mx-auto rounded-md bg-[#212121] rounded-xl text-gray-100 border-[1px] border-purple-500"
            />
            <Button type="submit" disabled={loading || input.trim() === ''}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </form>
      </div>
  )
}

export default Chat