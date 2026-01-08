import { useState, useEffect } from 'react';

function Messages() {
  const [campaigns, setCampaigns] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');

  // Données MOCK au lieu de fetch API
  useEffect(() => {
    // Simule un délai de chargement
    setTimeout(() => {
      setCampaigns([
        { 
          _id: '1', 
          name: 'Anniversaires', 
          message: 'Joyeux anniversaire {nom} ! Profite bien de ton anniversaire !', 
          contact: 'Jean Dupont',
        },
        { 
          _id: '2', 
          name: 'Rappels Rendez-vous', 
          message: 'Rappel: ton rdv demain à 14h', 
          contact: 'Marie Martin',
        }
      ]);
    }, 500);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simule l'API en ajoutant localement
    const newCampaign = {
      _id: Date.now().toString(),
      name,
      message,
      contact,
      status: 'draft'
    };
    
    setCampaigns([...campaigns, newCampaign]);
    setName('');
    setMessage('');
    setContact('');
    
    // Optionnel: simuler un appel API
    console.log('POST /api/campaigns:', { name, message, contact });
  };

  return (
    <div>
      <h1>Mes Campagnes</h1>
      
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Nom de la campagne"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <br />
        <textarea 
          placeholder="Message à envoyer"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <br />
        <input 
          type="text" 
          placeholder="Contact (nom ou numéro)"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
        />
        <br />
        <button type="submit">Créer la campagne</button>
      </form>

      <h2>Campagnes créées</h2>
      {campaigns.length === 0 ? (
        <p>Aucune campagne créée</p>
      ) : (
        <ul>
          {campaigns.map(campaign => (
            <li key={campaign._id}>
              <strong>{campaign.name}</strong> - Statut: {campaign.status}
              <br />
              Message: "{campaign.message}"
              <br />
              Pour: {campaign.contact}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Messages;