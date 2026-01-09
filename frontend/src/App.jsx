import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Messages from "./pages/Messages";
import SendMessage from './pages/SendMessage';
export default function App () {
  return (
    <div className="page">
      <header>
        <h1>AutoMessage</h1>
      </header>

      <nav>
        <Link to="/">Accueil</Link>
        <Link to="/messages">Messages</Link>
        <Link to="/send">Envoyer message</Link> | 
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<h1>AutoMessage</h1>} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/send" element={<SendMessage />} />
        </Routes>
      </main>
    </div>
  )
}
