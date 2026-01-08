import { useState, useEffect } from 'react';

function History() {
  const [messages, setMessages] = useState([]);

  //données MOCK, à remplacer quand il y aura l'API
  useEffect(() => {
    setTimeout(() => {
      setMessages([
        {
          _id: '1',
          date: '2024-03-15T10:00:00',
          contactName: 'Jean Dupont',
          content: 'Joyeux anniversaire !',
          status: 'sent'
        },
        {
          _id: '2',
          date: '2024-03-10T14:30:00',
          contactName: 'Marie Martin',
          content: 'Rappel: ton rdv demain à 14h',
          status: 'delivered'
        },
        {
          _id: '3',
          date: '2024-03-05T09:15:00',
          contactName: 'Pierre Durand',
          content: 'Merci pour la réunion',
          status: 'failed'
        }
      ]);
    }, 500);
  }, []);

  return (
    <div>
      <h1>Historique des Messages</h1>

      {messages.length === 0 ? (
        <p>Chargement de l'historique...</p>
      ) : (
        <table border="1" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Destinataire</th>
              <th>Message</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {messages.map(msg => (
              <tr key={msg._id}>
                <td>{new Date(msg.date).toLocaleString()}</td>
                <td>{msg.contactName}</td>
                <td>{msg.content}</td>
                <td>
                  {msg.status === 'sent' ? 'Envoyé' :
                   msg.status === 'delivered' ? 'Livré' :
                   msg.status === 'failed' ? 'Échec' : 'En attente'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default History;
