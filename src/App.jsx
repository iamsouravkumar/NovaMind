// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './config/firebase';
import GoogleLogin from './components/GoogleLogin';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, error] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      // Handle additional logic if needed
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
    <div>
      {user ? (
        <div>
          <Sidebar />
          <Chat user={user} />
        </div>
      ) : (
        <GoogleLogin setUser={setUser} />
      )}
    </div>
    <BrowserRouter>
    <Routes>
      <Route path="/login" element={<GoogleLogin setUser={setUser}/>} />"
      <Route path="/chat" element={<Chat user={user}/>} />
    </Routes>
  </BrowserRouter>
  </>
  );
};

export default App;