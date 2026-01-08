import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";


const root = document.getElementById('root')
ReactDOM.createRoot(root).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>

)
