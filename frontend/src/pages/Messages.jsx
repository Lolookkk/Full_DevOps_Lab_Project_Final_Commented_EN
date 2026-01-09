// frontend/src/pages/Messages.jsx
import { useState, useEffect } from 'react';

function Messages() {
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        // Données mock si API non disponible
        setMessages([
          {
            _id: '1',
            content: 'Joyeux anniversaire Jean ! 🎂',
            status: 'sent',
            sendDate: '2024-03-15T10:00:00.000Z',
            contactId: { name: 'Jean Dupont', phoneE164: '+33612345678' },
            templateUsed: 'birthday'
          },
          {
            _id: '2',
            content: 'Rappel: rendez-vous demain',
            status: 'scheduled',
            sendDate: '2024-03-20T14:00:00.000Z',
            contactId: { name: 'Marie Martin', phoneE164: '+33687654321' },
            templateUsed: 'reminder'
          }
        ]);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (id) => {
    if (window.confirm('Supprimer ce message ?')) {
      try {
        await fetch(`/api/messages/${id}`, { method: 'DELETE' });
        loadMessages(); // Recharger
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const filteredMessages = filter === 'all' 
    ? messages 
    : messages.filter(msg => msg.status === filter);

  return (
    <div>
      <h1>Historique des Messages</h1>
      
      {/* Filtres */}
      <div>
        <button onClick={() => setFilter('all')}>
          Tous ({messages.length})
        </button>
        <button onClick={() => setFilter('sent')}>
          ✅ Envoyés ({messages.filter(m => m.status === 'sent').length})
        </button>
        <button onClick={() => setFilter('scheduled')}>
          ⏰ Programmés ({messages.filter(m => m.status === 'scheduled').length})
        </button>
        <button onClick={() => setFilter('failed')}>
          ❌ Échoués ({messages.filter(m => m.status === 'failed').length})
        </button>
      </div>

      {/* Liste */}
      {loading ? (
        <p>Chargement...</p>
      ) : filteredMessages.length === 0 ? (
        <p>Aucun message trouvé</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th>Date</th>
              <th>Destinataire</th>
              <th>Message</th>
              <th>Template</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMessages.map(msg => (
              <tr key={msg._id}>
                <td>{new Date(msg.sendDate).toLocaleString()}</td>
                <td>
                  {msg.contactId?.name || 'Inconnu'}
                  <br />
                  <small>{msg.contactId?.phoneE164}</small>
                </td>
                <td>{msg.content}</td>
                <td>{msg.templateUsed || '-'}</td>
                <td>
                  {msg.status === 'sent' ? '✅' : 
                   msg.status === 'scheduled' ? '⏰' : 
                   msg.status === 'failed' ? '❌' : '📝'}
                </td>
                <td>
                  <button onClick={() => deleteMessage(msg._id)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Statistiques */}
      {messages.length > 0 && (
        <div>
          <h3>Statistiques</h3>
          <p>Total: {messages.length}</p>
          <p>Envoyés: {messages.filter(m => m.status === 'sent').length}</p>
          <p>Programmés: {messages.filter(m => m.status === 'scheduled').length}</p>
          <p>Échoués: {messages.filter(m => m.status === 'failed').length}</p>
        </div>
      )}
    </div>
  );
}

export default Messages;