// frontend/src/pages/SendMessage.jsx
import { useState, useEffect } from 'react';

function SendMessage() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [message, setMessage] = useState('');
  const [sendNow, setSendNow] = useState(true);
  const [scheduledDate, setScheduledDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Templates prédéfinis
  const templates = [
    { id: 'birthday', name: 'Anniversaire', content: 'Joyeux anniversaire {nom} ! 🎂' },
    { id: 'holiday', name: 'Fêtes', content: 'Joyeuses fêtes {nom} ! 🎄' },
    { id: 'reminder', name: 'Rappel', content: 'Rappel: {nom}, notre rendez-vous est demain.' },
    { id: 'custom', name: 'Personnalisé', content: '' }
  ];

  // Charger les contacts
  useEffect(() => {
    fetch('/api/contacts')
      .then(res => res.json())
      .then(data => setContacts(data))
      .catch(() => {
        // Données mock si API non disponible
        setContacts([
          { _id: '1', name: 'Jean Dupont', phoneE164: '+33612345678' },
          { _id: '2', name: 'Marie Martin', phoneE164: '+33687654321' }
        ]);
      });
  }, []);

  // Quand on change de template
  useEffect(() => {
    if (selectedTemplate && selectedTemplate !== 'custom') {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        setMessage(template.content);
      }
    }
  }, [selectedTemplate]);

  // Quand on change de contact, remplacer {nom}
  useEffect(() => {
    if (selectedContact && message.includes('{nom}')) {
      const contact = contacts.find(c => c._id === selectedContact);
      if (contact) {
        const updatedMessage = message.replace(/{nom}/g, contact.name);
        setMessage(updatedMessage);
      }
    }
  }, [selectedContact, message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      contactId: selectedContact,
      content: message,
      templateUsed: selectedTemplate === 'custom' ? '' : selectedTemplate,
      scheduledDate: sendNow ? null : scheduledDate
    };

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Message envoyé !');
        // Réinitialiser
        setSelectedContact('');
        setSelectedTemplate('');
        setMessage('');
        setScheduledDate('');
      }
    } catch (error) {
      alert('Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Envoyer un Message</h1>
      
      <form onSubmit={handleSubmit}>
        {/* Contact */}
        <div>
          <label>Destinataire:</label>
          <select 
            value={selectedContact} 
            onChange={(e) => setSelectedContact(e.target.value)}
            required
          >
            <option value="">Choisir un contact</option>
            {contacts.map(contact => (
              <option key={contact._id} value={contact._id}>
                {contact.name} ({contact.phoneE164})
              </option>
            ))}
          </select>
        </div>

        {/* Template */}
        <div>
          <label>Modèle:</label>
          <select 
            value={selectedTemplate} 
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            <option value="">Choisir un modèle</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div>
          <label>Message:</label>
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="4"
            placeholder="Votre message..."
            required
          />
        </div>

        {/* Options d'envoi */}
        <div>
          <label>
            <input 
              type="checkbox" 
              checked={sendNow}
              onChange={(e) => setSendNow(e.target.checked)}
            />
            Envoyer maintenant
          </label>
        </div>

        {!sendNow && (
          <div>
            <label>Date d'envoi programmée:</label>
            <input 
              type="datetime-local" 
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>
        )}

        {/* Bouton */}
        <button type="submit" disabled={loading}>
          {loading ? 'Envoi...' : 'Envoyer le message'}
        </button>
      </form>

      {/* Aide */}
      <div>
        <h3>Comment utiliser:</h3>
        <ul>
          <li>Utilisez {"{nom}"} dans votre message</li>
          <li>Il sera automatiquement remplacé par le nom du contact</li>
          <li>Les templates prédéfinis peuvent être modifiés</li>
        </ul>
      </div>
    </div>
  );
}

export default SendMessage;