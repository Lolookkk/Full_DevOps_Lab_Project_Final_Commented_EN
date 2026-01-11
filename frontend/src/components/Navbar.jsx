import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  
  const linkClass = (path) => 
    `px-4 py-2 rounded-md transition-colors ${location.pathname === path ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-600'}`;

  return (
    <nav className="bg-blue-800 shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/contacts" className="flex items-center gap-2 hover:opacity-90 transition">
            <span className="text-2xl">🤖</span>
            <span className="font-bold text-xl text-white tracking-wide">AutoMessage</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Link to="/contacts" className={linkClass('/contacts')}>Contacts</Link>
            <Link to="/events" className={linkClass('/events')}>Events</Link>
            
            {/* NEW LINK HERE */}
            <Link to="/connect" className={linkClass('/connect')}>
              📱 Connect WhatsApp
            </Link>

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