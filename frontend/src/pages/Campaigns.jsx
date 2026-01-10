import { useState, useEffect } from "react";

function Campaigns() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [template, setTemplate] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  // Templates mock
  const templates = [
    { id: "birthday", name: "Anniversaire", content: "Joyeux anniversaire {nom} !" },
    { id: "holiday", name: "Fêtes", content: "Joyeuses fêtes {nom} !" },
    { id: "custom", name: "Personnalisé", content: "" },
  ];

  // -------- MOCK DATA --------
  useEffect(() => {
    const mockContacts = [
      { _id: "1", name: "Jean Dupont", phoneE164: "+33612345678" },
      { _id: "2", name: "Marie Martin", phoneE164: "+33687654321" },
      { _id: "3", name: "Paul Durand", phoneE164: "+33611112222" },
    ];
    setContacts(mockContacts);

    // 5 campagnes mock
    setCampaigns([
      {
        _id: "c1",
        name: "Campagne Anniversaire Jean",
        description: "Souhaiter bon anniversaire à Jean",
        contacts: [mockContacts[0]],
        messageTemplate: templates[0].content,
        status: "completed",
        scheduledDate: new Date(Date.now() - 3600 * 1000),
        stats: { sentCount: 1, failedCount: 0 },
      },
      {
        _id: "c2",
        name: "Campagne Fêtes Marie",
        description: "Joyeuses fêtes",
        contacts: [mockContacts[1]],
        messageTemplate: templates[1].content,
        status: "scheduled",
        scheduledDate: new Date(Date.now() + 3600 * 1000),
        stats: { sentCount: 0, failedCount: 0 },
      },
      {
        _id: "c3",
        name: "Campagne personnalisée Paul",
        description: "Message custom",
        contacts: [mockContacts[2]],
        messageTemplate: "Hello {nom}, message personnalisé !",
        status: "scheduled",
        scheduledDate: new Date(Date.now() + 7200 * 1000),
        stats: { sentCount: 0, failedCount: 0 },
      },
      {
        _id: "c4",
        name: "Campagne échouée",
        description: "Test échec",
        contacts: [mockContacts[0]],
        messageTemplate: "Test message échoué",
        status: "cancelled",
        scheduledDate: new Date(Date.now() - 3600 * 1000),
        stats: { sentCount: 0, failedCount: 1 },
      },
      {
        _id: "c5",
        name: "Campagne envoyée",
        description: "Message déjà envoyé",
        contacts: [mockContacts[1]],
        messageTemplate: "Message déjà envoyé",
        status: "completed",
        scheduledDate: new Date(Date.now() - 2 * 3600 * 1000),
        stats: { sentCount: 1, failedCount: 0 },
      },
    ]);
  }, []);

  // -------- CREATE CAMPAIGN --------
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const selected = contacts.filter((c) => selectedContacts.includes(c._id));
    const newCampaign = {
      _id: Date.now().toString(),
      name,
      description,
      contacts: selected,
      messageTemplate: template,
      status: "scheduled",
      scheduledDate: new Date(scheduledDate),
      stats: { sentCount: 0, failedCount: 0 },
    };

    setCampaigns((prev) => [...prev, newCampaign]);

    setName("");
    setDescription("");
    setSelectedContacts([]);
    setTemplate("");
    setScheduledDate("");
    setLoading(false);
  };

  // -------- SEND NOW --------
  const sendNow = (id) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c._id === id
          ? { ...c, status: "completed", stats: { ...c.stats, sentCount: c.contacts.length } }
          : c
      )
    );
  };

  // -------- FILTERS --------
  const scheduled = campaigns.filter((c) => c.status === "scheduled");
  const completed = campaigns.filter((c) => c.status === "completed");
  const cancelled = campaigns.filter((c) => c.status === "cancelled");

  return (
    <div>
      <h1>Définir une campagne</h1>

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
          <label>Contacts</label>
          <select
            multiple
            value={selectedContacts}
            onChange={(e) =>
              setSelectedContacts(Array.from(e.target.selectedOptions, (o) => o.value))
            }
            required
          >
            {contacts.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.phoneE164})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Template</label>
          <select value={template} onChange={(e) => setTemplate(e.target.value)} required>
            <option value="">Choisir un template</option>
            {templates.map((t) => (
              <option key={t.id} value={t.content}>
                {t.name}
              </option>
            ))}
          </select>
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

      {/* -------- FUTURE CAMPAIGNS -------- */}
      <h2>Campagnes programmées</h2>
      {scheduled.length === 0 && <p>Aucune campagne programmée</p>}
      <ul>
        {scheduled.map((c) => (
          <li key={c._id}>
            <strong>{c.name}</strong> — {c.description} — <em>Status: {c.status}</em>
            <br />
            <button onClick={() => sendNow(c._id)}>Envoyer maintenant</button>
          </li>
        ))}
      </ul>

      {/* -------- HISTORY -------- */}
      <h2>Campagnes terminées</h2>
      {completed.length === 0 && <p>Aucune campagne terminée</p>}
      <ul>
        {completed.map((c) => (
          <li key={c._id}>
            <strong>{c.name}</strong> — {c.description} — <em>Status: {c.status}</em>
            <br />
            Envoyé à {c.stats.sentCount} contacts
          </li>
        ))}
      </ul>

      {/* -------- CANCELLED -------- */}
      <h2>Campagnes annulées</h2>
      {cancelled.length === 0 && <p>Aucune campagne annulée</p>}
      <ul>
        {cancelled.map((c) => (
          <li key={c._id}>
            <strong>{c.name}</strong> — {c.description} — <em>Status: {c.status}</em>
            <br />
            Échec pour {c.stats.failedCount} contacts
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Campaigns;
