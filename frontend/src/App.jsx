// src/App.jsx
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Contacts from './pages/Contacts';
import Events from './pages/Events';
import ConnectWhatsapp from './pages/ConnectWhatsapp';

// Improved Navbar Component
function Navbar() {
  const location = useLocation();
  
  // Helper to highlight active link
  const linkClass = (path) => 
    `px-4 py-2 rounded-md transition-colors ${location.pathname === path ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-600'}`;

  return (
    <nav className="bg-blue-800 shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <span className="font-bold text-xl text-white tracking-wide">AutoMessage</span>
          </div>

          {/* Navigation Links */}
          <div className="flex gap-2">
            <Link to="/contacts" className={linkClass('/contacts')}>Contacts</Link>
            <Link to="/events" className={linkClass('/events')}>Events</Link>
            <button 
              onClick={() => { localStorage.clear(); window.location.href = '/' }} 
              className="ml-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/connect" element={<><Navbar /><ConnectWhatsapp /></>} />
          <Route path="/contacts" element={<><Navbar /><Contacts /></>} />
          <Route path="/events" element={<><Navbar /><Events /></>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;