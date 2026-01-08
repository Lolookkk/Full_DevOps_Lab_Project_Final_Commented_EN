import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Messages from "./pages/Messages";
import History from "./pages/History";
export default function App () {
  return (
    <div className="page">
      <header>
        <h1>AutoMessage</h1>
      </header>

      <nav>
        <Link to="/">Accueil</Link>
        <Link to="/messages">Messages</Link>
        <Link to="/history">History</Link>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<h1>AutoMessage</h1>} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
    </div>
  )
}
