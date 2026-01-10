import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import DefineMessages from './pages/DefineMessages';
import Campaigns from './pages/Campaigns';
import './app.css'
export default function App () {
  return (
    <div className="page">
      <header>
        <h1>AutoMessage</h1>
      </header>

      <nav>
        <Link to="/">Accueil</Link>
        <Link to="/messages">Messages</Link> 
        <Link to="/campaigns">Campaigns</Link> 
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<h1>AutoMessage</h1>} />
          <Route path="/messages" element={<DefineMessages />} />
          <Route path="/campaigns" element={<Campaigns />} />
        </Routes>
      </main>
    </div>
  )
}