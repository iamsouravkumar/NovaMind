import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import AuthPage from './components/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <div className="flex h-screen">
              <Sidebar />
              <Chat />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/chat/:chatId" element={
          <ProtectedRoute>
            <div className="flex h-screen">
              <Sidebar />
              <Chat />
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;