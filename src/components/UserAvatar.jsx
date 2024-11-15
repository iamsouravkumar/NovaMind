import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, LogOut, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { chatService } from '../services/chatService';

const UserAvatar = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const handleDeleteAllChats = async () => {
    try {
      await chatService.deleteAllChats();
      setShowDropdown(false);
      toast.success('Chats history deleted successfully');
    } catch (error) {
      if (error.message === 'No chats to delete') {
        toast.error('No chats to delete');
        setShowDropdown(false);
      } else {
        console.error('Error:', error);
        toast.error('Failed to delete chats history');
        setShowDropdown(false);
      }
    }
  };

  const handleAbout = () => {
    navigate('/about');
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <motion.button
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
        onClick={() => setShowDropdown(!showDropdown)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-8 h-8 rounded-full border-2 border-purple-500"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white">
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
        )}
        <span className="text-white text-sm hidden md:block">
          {user?.displayName || user?.email?.split('@')[0] || 'User'}
        </span>
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-50 max-md:z-0"
          >
            <div className="px-4 py-2 border-b border-gray-700">
              <p className="text-sm text-white font-medium truncate">
                {user?.displayName || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            
            <button
              onClick={() => {/* Add profile settings handler */}}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            
            <button
              onClick={handleDeleteAllChats}
              className="w-full text-left px-4 py-2 text-sm text-orange-400 hover:bg-gray-700 flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>

            <button
              onClick={handleAbout}
              className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-gray-700 flex items-center space-x-2"
            >
              <img src="/public/star.png" alt="" className='w-4 h-4'/>
              <span>About</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserAvatar; 