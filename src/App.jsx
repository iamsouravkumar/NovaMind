import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import GoogleLogin from './components/GoogleLogin';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import AvatarModal from './components/AvatarModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const App = () => {
  const [user, setUser] = useState(null); // Firebase auth user
  const [selectedChat, setSelectedChat] = useState(null); // Chat selected from Sidebar
  const [isSettingOpen, setIsSettingOpen] = useState(false);

  // Handle Firebase Authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const toggleSetting = () => {
    setIsSettingOpen((prev) => !prev);
  };

  return (
    <div className="app-container">
      {user ? (
        <>
          {/* Sidebar for showing chat list and selecting chats */}
          <Sidebar setSelectedChat={setSelectedChat} />

          {/* Main chat area for selected conversation */}
          <Chat selectedChat={selectedChat} user={user} />

          {/* Avatar that toggles the settings modal */}
          <div className='fixed top-0 right-0 flex justify-end px-4 py-3 cursor-pointer'>
            <Avatar className="w-9 h-9" onClick={toggleSetting}>
              <AvatarImage src={auth.currentUser.photoURL} />
              <AvatarFallback>{auth.currentUser.displayName[0]}</AvatarFallback>
            </Avatar>
          </div>
        </>
      ) : (
        <GoogleLogin setUser={setUser} />
      )}

      {/* Conditionally render AvatarModal based on isSettingOpen */}
      {isSettingOpen && (
        <AvatarModal
          user={user}
          setUser={setUser}
          onClose={toggleSetting} // Pass toggle to close modal when clicking outside or on close
          className=""
        />
      )}
    </div>
  );
};

export default App;