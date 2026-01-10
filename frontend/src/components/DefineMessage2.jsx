import { useState, useEffect } from "react";

export default function DefineMessage() {
  const [contacts, setContacts] = useState([]);
  const [events, setEvents] = useState([]);
  const [messages, setMessages] = useState([]);

  const [selectedContact, setSelectedContact] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [messageContent, setMessageContent] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Token JWT dans localStorage
  const token = localStorage.getItem("token");

  const templates = [
    { id: "birthday", name: "Anniversaire", content: "Joyeux anniversaire {nom} ! 🎂" },
    { id: "holiday", name: "Fêtes", content: "Joyeuses fêtes {nom} ! 🎄" },
    { id: "custom", name: "Personnalisé", content: "" },
  ];

  // -------- UTILS --------
  const applyContactName = (text, contactId) => {
    if (!text || !contactId) return text;
    const contact = contacts.find((c) => c._id === contactId);
    if (!contact) return text;
    return text.replace(/{nom}/g, contact.name);
  };

  // -------- FETCH CONTACTS & EVENTS --------
  useEffect(() => {
    async function fetchContacts() {
      if (!token) return;

      try {
        const res = await fetch("/api/contacts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Impossible de charger les contacts");
        const data = await res.json();
        setContacts(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    }

    async function fetchEvents() {
      if (!token) return;

      try {
        const res = await fetch("/api/events", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Impossible de charger les événements");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    }

    fetchContacts();
    fetchEvents();
  }, [token]);

  // -------- FETCH MESSAGES --------
  useEffect(() => {
    async function fetchMessages() {
      if (!token) return;

      try {
        const res = await fetch("/api/messages", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Impossible de charger les messages");
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    }

    fetchMessages();
  }, [token]);

  // -------- TEMPLATE CHANGE --------
  useEffect(() => {
    if (selectedTemplate && selectedTemplate !== "custom") {
      const template = templates.find((t) => t.id === selectedTemplate);
      if (template) {
        setMessageContent(applyContactName(template.content, selectedContact));
      }
    }
  }, [selectedTemplate, selectedContact]);

  // -------- CREATE MESSAGE --------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedContact || !messageContent) return;

    setLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipient: selectedContact,
          event: selectedEvent || null,
          content: messageContent,
        }),
      });
      if (!res.ok) throw new Error("Erreur création message");

      const newMessage = await res.json();
      setMessages((prev) => [...prev, newMessage]);
      setSelectedContact("");
      setSelectedEvent("");
      setSelectedTemplate("");
      setMessageContent("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Définir un message</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Destinataire</label>
          <select
            value={selectedContact}
            onChange={(e) => setSelectedContact(e.target.value)}
            required
          >
            <option value="">Choisir un contact</option>
            {contacts.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.phoneE164})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Événement</label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            <option value="">Aucun événement</option>
            {events
              .filter((ev) => ev.contactId === selectedContact)
              .map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.type} - {new Date(ev.date).toLocaleDateString()}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label>Modèle</label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            <option value="">Choisir un modèle</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Message</label>
          <textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            rows="4"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Envoi..." : "Programmer le message"}
        </button>
      </form>

      <h2>Messages</h2>
      {messages.length === 0 && <p>Aucun message</p>}
      <ul>
        {messages.map((m) => (
          <li key={m._id}>
            <strong>
              {contacts.find((c) => c._id === m.recipient)?.name || "Inconnu"}
            </strong>{" "}
            — {m.content} — <em>{m.status}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}
