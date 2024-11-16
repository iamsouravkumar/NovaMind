import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Send } from 'lucide-react'
import { chatService } from '../services/chatService'
import { toast } from 'react-hot-toast'
import UserAvatar from './UserAvatar'
import ChatLoader from './ChatLoader'
import ModelSelectionModal from './ModelSelectionModal'
import { HiMiniPencilSquare } from "react-icons/hi2"
import CreateMsgLoader from './CreateMsgLoader'
import PredefinedPrompts from './PredefinedPrompts'
const starLogo = 'https://cdn-icons-png.flaticon.com/128/11618/11618860.png'
import '../App.css'

const Chat = ({ isSidebarOpen }) => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [msgLoading, setMsgLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-pro')
  const [chatLoading, setChatLoading] = useState(false)
  const [createChatLoading, setCreateChatLoading] = useState(false)
  const [firstMessageSent, setFirstMessageSent] = useState(false)

  const { chatId } = useParams()
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    let unsubscribe

    if (chatId) {
      setChatLoading(true)
      unsubscribe = chatService.subscribeToChats((chats) => {
        const currentChat = chats.find(chat => chat.id === chatId)
        if (currentChat) {
          setMessages(currentChat.messages || [])
          setChatLoading(false)
        }
      })
    } else {
      setMessages([])
      setChatLoading(false)
    }

    return () => unsubscribe && unsubscribe()
  }, [chatId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    adjustTextareaHeight()
  }, [input])

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = '35px'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)
    setMsgLoading(true)

    const newMessage = {
      content: userMessage,
      role: 'user',
    }

    setMessages(prevMessages => [...prevMessages, newMessage])

    if (!firstMessageSent) {
      document.title = userMessage.length > 0 ? userMessage.slice(0, 30) : 'Untitled Chat'
      setFirstMessageSent(true)
    }

    setTimeout(() => {
      const botPlaceholder = {
        content: 'LowCode GPT is Analyzing...',
        role: 'assistant',
        loading: true,
      }
      setMessages(prevMessages => [...prevMessages, botPlaceholder])
    }, 300)

    try {
      let newChatId

      if (chatId) {
        await chatService.addMessage(chatId, userMessage, selectedModel)
      } else {
        newChatId = await chatService.createChat(userMessage, selectedModel)
        navigate(`/chat/${newChatId}`)
      }

      const botResponse = await chatService.generateResponse(userMessage, selectedModel)

      setMessages(prevMessages => {
        return prevMessages.map(msg =>
          msg.loading ? { content: botResponse, role: 'assistant' } : msg
        )
      })

    } catch (error) {
      console.error('Error sending message:', error)
      if (error.message.includes('blocked due to safety')) {
        toast.error('Your message was blocked due to safety concerns. Please try rephrasing it.')
      } else if (error.message.includes('Candidate was blocked due to RECITATION')) {
        toast.error('Your message was blocked due to recitation concerns. Please try rephrasing it.')
      } else {
        toast.error('Failed to send message')
      }
      setInput(userMessage)
    } finally {
      setLoading(false)
      setMsgLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const handleNewChat = async () => {
    setCreateChatLoading(true)
    const newChatId = await chatService.createChat('Hii', selectedModel)
    navigate(`/chat/${newChatId}`)
    setCreateChatLoading(false)
  }

  const formatMessageContent = (content) => {
    const boldTextRegex = /\*\*(.*?)\*\*/g
    const codeTextRegex = /`([^`]+)`/g

    return content
      .replace(boldTextRegex, '<strong>$1</strong>')
      .replace(codeTextRegex, (match, code) =>
        `<div class="relative"><pre class="bg-gray-200 p-2 rounded"><code>${code}</code></pre>
        <button class="copy-button absolute top-0 right-0 p-2" onclick="copyToClipboard('${code.replace(/'/g, "\\'").replace(/"/g, '\\"')}')">📋</button></div>`)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!')
    }).catch(err => {
      console.error('Failed to copy: ', err)
    })
  }

  const handlePredefinedPrompt = (prompt) => {
    setInput(prompt)
  }

  const text = "How can I help you today?"
  const isChatPage = window.location.pathname === `/chat/${chatId}`

  return (
    <div className={`fixed top-0 flex flex-col h-[100%] transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-[80%] ml-[20%]' : 'w-full ml-0'} dark:bg-gray-900 max-md:w-[100%] max-md:ml-0`}>
      {createChatLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="flex flex-col gap-1 justify-center items-center"><CreateMsgLoader /></div>
        </div>
      )}
      <div className={`flex ${isChatPage ? 'justify-end' : 'justify-between flex-row-reverse max-md:ml-28'} items-center p-1`}>
        {isChatPage ? (
          <button className="text-gray-400 hover:text-white transition-colors duration-200 p-1">
            <HiMiniPencilSquare className="w-8 h-8 lg:hidden" onClick={handleNewChat} />
          </button>
        ) : (
          <div className='z-50'>
            <UserAvatar />
          </div>
        )}

        {isChatPage && (
          <div className={`max-md:hidden fixed top-[10px] transition-all duration-300 ease-in-out ${isSidebarOpen ? 'left-[22%]' : 'left-[5%]'}`}>
            <ModelSelectionModal
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
            />
          </div>
        )}

        {isChatPage && (
          <div className='max-md:hidden'>
            <UserAvatar />
          </div>
        )}

        {!isChatPage && (
          <div className={`ml-[2%] max-md:ml-0 ${!isSidebarOpen ? 'transition-all duration-300 ease-in-out lg:ml-[4%]' : ''}`}>
            <ModelSelectionModal
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-md:p-2">
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
              <motion.div className="flex justify-center text-center max-md:mx-auto max-md:px-3">
                {text.split(' ').map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.25 }}
                    className="text-2xl font-bold text-gray-100 dark:text-gray-300 mx-1 max-md:text-2xl"
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.div>

              <div className="flex flex-wrap justify-center gap-4 mt-4">
                <PredefinedPrompts onPromptSelect={handlePredefinedPrompt} />
              </div>
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
                <div className={`flex items-start space-x-2 max-w-[70%] max-md:max-w-[90%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className='flex flex-row my-4 max-w-2xl max-md:my-3'>
                    {message.role !== 'user' && (
                      <div className="flex-shrink-0">
                        <img src={starLogo} alt="LowCode GPT" height={35} width={35} className={`max-md:hidden ${message.loading ? 'animate-spin' : ''}`} />
                      </div>
                    )}
                    <div className={`rounded-lg p-3 mx-3 ${message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 '
                      } ${message.loading ? 'animate-pulse' : ''}`}>
                      <div className='flex'>
                        <p className={`text-sm whitespace-pre-wrap arial ${message.role === 'assistant' ? '' : ''}`} dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }} />
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

      <div className="relative w-full max-w-4xl mx-auto mb-2 p-[3px] bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 animate-border-run transition-all duration-300 ease-in-out max-md:w-[90%]" style={{borderRadius: input.length > 0 ? '1rem' : '2rem'}}>
        <form onSubmit={handleSendMessage} className="relative flex bg-[#212121] transition-all duration-300 ease-in-out" style={{borderRadius: input.length > 0 ? '1rem' : '2rem', alignItems:input.length > 0 ? 'end' : 'center'}}>
          <div className="relative flex-grow">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-500/10 to-indigo-400/10 animate-gradient-shift transition-all duration-300 ease-in-out" style={{borderRadius: input.length > 0 ? '1rem' : '2rem'}}></div>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message LowCode GPT..."
              className="w-full px-6 py-3 bg-transparent text-white placeholder-gray-100 focus:outline-none relative z-10 max-md:placeholder:text-sm resize-none flex items-center"
              style={{
                minHeight: '35px',
                maxHeight: '150px',
                borderRadius: input.length > 0 ? '1rem' : '2rem',
              }}
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
      <p className='text-xs text-gray-400 text-center mb-1 max-md:hidden'>LowCode GPT can make mistakes and is not guaranteed to be 100% accurate.</p>
    </div>
  )
}

export default Chat