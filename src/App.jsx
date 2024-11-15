import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import AuthPage from './components/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import AboutUs from './components/About';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <Router>
      <Routes>
        
        <Route path="/login" element={<AuthPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/" element={
          <ProtectedRoute>
            <div className="flex h-screen">
              <Sidebar onToggle={setIsSidebarOpen} />
              <Chat isSidebarOpen={isSidebarOpen} />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/chat/:chatId" element={
          <ProtectedRoute>
            <div className="flex h-screen">
              <Sidebar onToggle={setIsSidebarOpen} />
              <Chat isSidebarOpen={isSidebarOpen} />
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;