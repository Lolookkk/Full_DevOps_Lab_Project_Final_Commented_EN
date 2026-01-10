import { useState, useEffect } from "react";
import './DefineMessages.css'
export default function DefineMessage() {
  const [contacts, setContacts] = useState([]);
  const [events, setEvents] = useState([]);
  const [messages, setMessages] = useState([]);

  const [selectedContact, setSelectedContact] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTYyYmFiNWM0OTJlNWMwNDEzNDBkOGIiLCJpZCI6IjY5NjJiYWI1YzQ5MmU1YzA0MTM0MGQ4YiIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImlhdCI6MTc2ODA3ODAwNSwiZXhwIjoxNzY4MTY0NDA1fQ.TY9vjuRmlWSkDb9OL48jperK1NSqSKdmIzlBXa-zD2o");
  const token = localStorage.getItem("token");

  const templates = [
    { id: "birthday", name: "Anniversaire", content: "Joyeux anniversaire {nom} ! 🎂" },
    { id: "holiday", name: "Fêtes", content: "Joyeuses fêtes {nom} ! 🎄" },
    { id: "custom", name: "Personnalisé", content: "" },
  ];

  // ---------- UTIL ---------- //
  const applyContactName = (text, contactId) => {
    if (!text || !contactId) return text;
    const contact = contacts.find((c) => c._id === contactId);
    return contact ? text.replace(/{nom}/g, contact.name) : text;
  };

  // ---------- FETCH CONTACTS, EVENTS, MESSAGES ---------- //
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [contactsRes, eventsRes, messagesRes] = await Promise.all([
          fetch("/api/contacts", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/events", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/messages", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!contactsRes.ok) throw new Error("Impossible de charger les contacts");
        if (!eventsRes.ok) throw new Error("Impossible de charger les événements");
        if (!messagesRes.ok) throw new Error("Impossible de charger les messages");

        setContacts(await contactsRes.json());
        setEvents(await eventsRes.json());
        setMessages(await messagesRes.json());
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, [token]);

  // ---------- TEMPLATE CHANGE ---------- //
  useEffect(() => {
    if (selectedTemplate && selectedTemplate !== "custom") {
      const template = templates.find((t) => t.id === selectedTemplate);
      if (template) {
        setMessageContent(applyContactName(template.content, selectedContact));
      }
    }
  }, [selectedTemplate, selectedContact]);

  // ---------- CREATE MESSAGE ---------- //
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedContact || !messageContent) return;

    setLoading(true);
    try {
      // CREATE NEW MESSAGE
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: selectedContact,
          event: selectedEvent || null,
          content: messageContent,
          scheduledAt,
        }),
      });

      if (!res.ok) throw new Error("Erreur création message");

      const updatedMessage = await res.json();
      setMessages((prev) => [...prev, updatedMessage]);

      // Reset form
      setSelectedContact("");
      setSelectedEvent("");
      setSelectedTemplate("");
      setMessageContent("");
      setScheduledAt("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------- FILTER MESSAGES ---------- //
  const scheduledMessages = messages.filter((m) => m.status === "scheduled");
  const sentMessages = messages.filter((m) => m.status === "sent");
  const failedMessages = messages.filter((m) => m.status === "failed");

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

        <div>
          <label>Date d'envoi</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Envoi..." : "Programmer le message"}
        </button>
      </form>

      {/* ---------- MESSAGES ---------- */}
      <h2>Messages programmés</h2>
      {scheduledMessages.length === 0 && <p>Aucun message programmé</p>}
      <ul>
        {scheduledMessages.map((m) => {
          const contact =
            typeof m.recipient === "string"
              ? contacts.find((c) => c._id === m.recipient)
              : m.recipient;
          const event = events.find((e) => e._id === m.event);

          return (
            <li key={m._id}>
              <strong>{contact?.name || "Inconnu"}</strong> — {m.content}{" "}
              {event && <>({event.type} - {new Date(event.date).toLocaleDateString()})</>} —{" "}
              <em>{m.status}</em>
            </li>
          );
        })}
      </ul>

      <h2>Historique des messages envoyés</h2>
      <ul>
        {sentMessages.map((m) => {
          const contact =
            typeof m.recipient === "string"
              ? contacts.find((c) => c._id === m.recipient)
              : m.recipient;
          return (
            <li key={m._id}>
              <strong>{contact?.name || "Inconnu"}</strong> — {m.content} —{" "}
              <em>{m.status}</em>
              <br />
              Envoyé le {new Date(m.sentAt).toLocaleString()}
            </li>
          );
        })}
      </ul>

      <h2>Messages échoués</h2>
      <ul>
        {failedMessages.map((m) => {
          const contact =
            typeof m.recipient === "string"
              ? contacts.find((c) => c._id === m.recipient)
              : m.recipient;
          return (
            <li key={m._id}>
              <strong>{contact?.name || "Inconnu"}</strong> — {m.content} —{" "}
              <em>{m.status}</em>
              <br />
              Erreur: {m.errorLog}
            </li>
          );
        })}
      </ul>
    </div>
  );
}