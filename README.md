# AutoMessage Monorepo

This repo contains a minimal backend (Express + tests + lint) and a minimal frontend (Vite + React) to unblock parallel work.

## Quickstart

Backend:
```bash
cd backend
npm ci
npm run dev          # http://localhost:3000
npm test -- --coverage
```

Frontend:
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

## Backend routes

- `GET /` basic JSON greeting
- `GET /health` health check (200 OK)
- `GET /version` returns `{ version }` from `package.json`
- `GET /info` returns `{ name, version, node, uptime }`
- `GET /boom` triggers an error to test the global error handler

Routes are auto-mounted from `backend/src/routes/auto/*.route.js`.

## Project layout

```
AutoMessage/
├── backend/                  # Node.js & Express API ("The Brain")
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   │   ├── db.js         # Database connection logic
│   │   │   └── whatsapp.js   # WhatsApp client setup (whatsapp-web.js)
│   │   ├── controllers/      # Logic for handling requests (getContacts, sendMessage, etc.)
│   │   ├── middlewares/      # Express middlewares (auth, validation)
│   │   ├── models/           # Mongoose schemas (User, Contact, Message, Event)
│   │   ├── routes/           # API route definitions
│   │   │   └── auto/         # Auto-mounted routes
│   │   ├── utils/            # Helper functions
│   │   │   └── appinfo.js
│   │   │   └── errorHandler.js
│   │   │   └── scheduler.js
│   │   │   └── status.js
│   │   │   └── Validator.js
│   │   ├── app.js            # Express app setup & Middleware configuration
│   │   ├── index.js          # Entry point (Server listener)
│   │   ├── scheduler.js      # Cron jobs for automated messages
│   │   └── seed.js           # Script to populate DB with dummy data
│   ├── .env                  # Environment variables (MONGO_URI, SECRET_KEY)
│   ├── .gitignore
│   └── package.json
│
├── frontend/                 # React + Vite Application ("The UI")
│   ├── src/
│   │   ├── api/              # Axios setup for backend communication
│   │   │   └── axios.js
│   │   ├── components/       # Reusable UI components
│   │   │   └── Navbar.jsx
│   │   ├── pages/            # Main application pages
│   │   │   ├── ConnectWhatsapp.jsx
│   │   │   ├── Contacts.jsx
│   │   │   ├── Events.jsx
│   │   │   └── Login.jsx
│   │   ├── App.jsx           # Main Router & Layout definition
│   │   ├── index.css         # Global styles & Tailwind directives
│   │   └── main.jsx          # React DOM entry point
│   ├── index.html            # HTML entry point
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   ├── vite.config.js        # Vite configuration
│   └── package.json
│
├── .gitignore                # Global git ignore (node_modules, .env, .wwebjs_auth)
└── README.md                 # Project documentation
```

## CI (GitHub Actions)

The workflow runs backend lint + tests with coverage, and builds the frontend.
