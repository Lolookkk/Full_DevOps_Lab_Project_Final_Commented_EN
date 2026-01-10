import { useState, useEffect } from "react";

export default function Campaigns() {
  const [contacts, setContacts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [messageTemplate, setMessageTemplate] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // -------- FETCH CONTACTS --------
  useEffect(() => {
    if (!token) return;
    const fetchContacts = async () => {
      try {
        const res = await fetch("/api/contacts", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Impossible de charger les contacts");
        setContacts(await res.json());
      } catch (err) {
        setError(err.message);
      }
    };
    fetchContacts();
  }, [token]);

  // -------- FETCH CAMPAIGNS --------
  useEffect(() => {
    if (!token) return;
    const fetchCampaigns = async () => {
      try {
        const res = await fetch("/api/campaigns", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Impossible de charger les campagnes");
        setCampaigns(await res.json());
      } catch (err) {
        setError(err.message);
      }
    };
    fetchCampaigns();
  }, [token]);

  // -------- CREATE CAMPAIGN --------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || selectedContacts.length === 0 || !scheduledDate) return;
    setLoading(true);

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          contacts: selectedContacts,
          messageTemplate,
          scheduledDate,
        }),
      });

      if (!res.ok) throw new Error("Impossible de créer la campagne");

      const newCampaign = await res.json();
      setCampaigns((prev) => [...prev, newCampaign]);

      // reset form
      setName("");
      setDescription("");
      setMessageTemplate("");
      setSelectedContacts([]);
      setScheduledDate("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleContact = (contactId) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map((c) => c._id));
    }
  };

  // -------- FILTER CAMPAIGNS --------
  const scheduled = campaigns.filter((c) => c.status === "scheduled");
  const completed = campaigns.filter((c) => c.status === "completed");
  const cancelled = campaigns.filter((c) => c.status === "cancelled");

  // -------- UTIL TO DISPLAY CONTACT NAMES --------
  const renderContactNames = (campaignContacts) => {
    if (!campaignContacts || campaignContacts.length === 0) return "Aucun contact";

    const names = campaignContacts.map((c) => {
      // 1. Si le backend a bien 'populate' le contact
      if (c && c.name) return c.name;

      // 2. Sinon, on essaie de retrouver le contact dans notre liste locale 'contacts'
      const id = typeof c === "string" ? c : c._id;
      const found = contacts.find((contact) => contact._id === id);
      return found ? found.name : "Contact inconnu";
    });

    return names.join(", ");
  };

  return (
    <div>
      <h1>Définir une campagne</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <label>Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <label>Modèle de message</label>
          <textarea
            value={messageTemplate}
            onChange={(e) => setMessageTemplate(e.target.value)}
            rows="3"
            required
          />
        </div>

        <div>
          <label>Contacts</label>
          <div>
            <div>
              <input
                type="checkbox"
                checked={selectedContacts.length === contacts.length && contacts.length > 0}
                onChange={handleSelectAll}
              />{" "}
              <strong>Tout sélectionner</strong>
            </div>
            {contacts.map((c) => (
              <div key={c._id}>
                <input
                  type="checkbox"
                  value={c._id}
                  checked={selectedContacts.includes(c._id)}
                  onChange={() => toggleContact(c._id)}
                />{" "}
                {c.name} ({c.phoneE164})
              </div>
            ))}
          </div>
        </div>

        <div>
          <label>Date d'envoi</label>
          <input
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : "Programmer la campagne"}
        </button>
      </form>

      <h2>Campagnes programmées</h2>
      {scheduled.length === 0 && <p>Aucune campagne programmée</p>}
      <ul>
        {scheduled.map((c) => (
          <li key={c._id}>
            <strong>{c.name}</strong> — {c.description} — <em>Status: {c.status}</em>
            <br />
            Date d'envoi : {new Date(c.scheduledDate).toLocaleString()}
            <br />
            Contacts : {renderContactNames(c.contacts)}
          </li>
        ))}
      </ul>

      <h2>Campagnes terminées</h2>
      {completed.length === 0 && <p>Aucune campagne terminée</p>}
      <ul>
        {completed.map((c) => (
          <li key={c._id}>
            <strong>{c.name}</strong> — {c.description} — <em>Status: {c.status}</em>
            <br />
            Date d'envoi : {new Date(c.scheduledDate).toLocaleString()}
            <br />
            Contacts : {renderContactNames(c.contacts)}
            <br />
            Envoyé à {c.stats?.sentCount || 0} contacts
          </li>
        ))}
      </ul>

      <h2>Campagnes annulées</h2>
      {cancelled.length === 0 && <p>Aucune campagne annulée</p>}
      <ul>
        {cancelled.map((c) => (
          <li key={c._id}>
            <strong>{c.name}</strong> — {c.description} — <em>Status: {c.status}</em>
            <br />
            Date d'envoi : {new Date(c.scheduledDate).toLocaleString()}
            <br />
            Contacts : {renderContactNames(c.contacts)}
            <br />
            Échec pour {c.stats?.failedCount || 0} contacts
          </li>
        ))}
      </ul>
    </div>
  );
}
