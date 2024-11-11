import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import GoogleLogin from './components/GoogleLogin';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import AvatarModal from './components/AvatarModal';
import Loader from './components/Loader'
import { Toaster } from 'react-hot-toast';

const App = () => {
  const [user, setUser] = useState(null); // Firebase auth user
  const [selectedChat, setSelectedChat] = useState(null); // Chat selected from Sidebar
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Handle Firebase Authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleSetting = () => {
    setIsSettingOpen((prev) => !prev);
  };

  if (loading) {
    return (
      <div className='h-screen w-screen flex justify-center items-center'><Loader/></div>
    )
  }

  return (
    <div className="app-container">
      <Toaster position='top-middle' duratation={3000}/>
      {user ? (
        <>
          {/* Sidebar for showing chat list and selecting chats */}
          <Sidebar setSelectedChat={setSelectedChat} />

          {/* Main chat area for selected conversation */}
          <Chat selectedChat={selectedChat} user={user} />

          {/* Avatar that toggles the settings modal */}
          <div className='fixed top-0 right-0 flex justify-end px-4 py-3 cursor-pointer rounded-full'>
            <div className="w-9 h-9" onClick={toggleSetting}>
              <img className="rounded-full" src={auth.currentUser.photoURL} />
              {/* <div>{auth.currentUser.displayName[0]}</div> */}
            </div>
          </div>
        </>
      ) : (
        <GoogleLogin setUser={setUser} user={user}/>
      )}

      {/* Conditionally render AvatarModal based on isSettingOpen */}
      {user && isSettingOpen && (
        <AvatarModal
          user={user}
          setUser={setUser}
          onClick={toggleSetting} // Pass toggle to close modal when clicking outside or on close
          className=""
        />
      )}
      
    </div>
  );
};

export default App;