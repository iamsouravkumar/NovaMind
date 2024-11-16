import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import AuthPage from './components/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import AboutUs from './components/About';
import { auth } from './config/firebase'; // Import your Firebase config

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser({ name: user.displayName || user.email }); // Set user name
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        
        <Route path="/login" element={<AuthPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/" element={
          <ProtectedRoute>
            <div className="flex h-screen">
              <Sidebar onToggle={setIsSidebarOpen} />
              <Chat isSidebarOpen={isSidebarOpen} user={user} />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/chat/:chatId" element={
          <ProtectedRoute>
            <div className="flex h-screen">
              <Sidebar onToggle={setIsSidebarOpen} />
              <Chat isSidebarOpen={isSidebarOpen} user={user} />
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;