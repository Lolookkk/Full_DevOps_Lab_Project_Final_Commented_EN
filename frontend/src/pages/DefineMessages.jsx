import { useState, useEffect } from 'react'
import './DefineMessages.css'

function DefineMessage() {
  const [contacts, setContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])

  const templates = [
    { id: 'birthday', name: 'Anniversaire', content: 'Joyeux anniversaire {nom} ! 🎂' },
    { id: 'holiday', name: 'Fêtes', content: 'Joyeuses fêtes {nom} ! 🎄' },
    { id: 'custom', name: 'Personnalisé', content: '' }
  ]

  // -------- MOCK DATA --------
  useEffect(() => {
    const mockContacts = [
      { _id: '1', name: 'Jean Dupont', phoneE164: '+33612345678' },
      { _id: '2', name: 'Marie Martin', phoneE164: '+33687654321' },
      { _id: '3', name: 'Paul Durand', phoneE164: '+33611112222' }
    ]
    setContacts(mockContacts)

    // 5 messages mock présents de base
    setMessages([
      {
        _id: 'm1',
        recipient: mockContacts[0],
        content: 'Joyeux anniversaire Jean ! 🎂',
        status: 'sent',
        sentAt: new Date()
      },
      {
        _id: 'm2',
        recipient: mockContacts[1],
        content: 'Joyeuses fêtes Marie ! 🎄',
        status: 'scheduled',
        scheduledAt: new Date(Date.now() + 3600* 1000)
      },
      {
        _id: 'm3',
        recipient: mockContacts[2],
        content: 'Hello Paul, message personnalisé !',
        status: 'scheduled',
        scheduledAt: new Date(Date.now() + 7200*1000)
      },
      {
        _id: 'm4',
        recipient: mockContacts[0],
        content: 'Test message échoué',
        status: 'failed',
        scheduledAt: new Date(Date.now() - 3600 * 1000),
        errorLog: 'Erreur réseau'
      },
      {
        _id: 'm5',
        recipient: mockContacts[1],
        content: 'Message déjà envoyé',
        status: 'sent',
        sentAt: new Date(Date.now() - 2 * 3600 * 1000)
      }
    ])
  }, [])

  // -------- UTILS --------
  const applyContactName = (text, contactId) => {
    if (!text || !contactId) return text
    const contact = contacts.find(c => c._id === contactId)
    if (!contact) return text
    return text.replace(/{nom}/g, contact.name)
  }

  // -------- TEMPLATE CHANGE --------
  useEffect(() => {
    if (selectedTemplate && selectedTemplate !== 'custom') {
      const template = templates.find(t => t.id === selectedTemplate)
      if (template) {
        setMessage(applyContactName(template.content, selectedContact))
      }
    }
  }, [selectedTemplate, selectedContact])

  // -------- CREATE MESSAGE --------
  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    const recipient = contacts.find(c => c._id === selectedContact)

    const newMessage = {
      _id: Date.now().toString(),
      recipient,
      content: applyContactName(message, selectedContact),
      status: 'scheduled',
      scheduledAt: new Date()
    }

    setMessages(prev => [...prev, newMessage])

    setSelectedContact('')
    setSelectedTemplate('')
    setMessage('')
    setLoading(false)
  }

  // -------- SEND NOW --------
  const sendNow = (id) => {
    setMessages(prev =>
      prev.map(msg =>
        msg._id === id
          ? { ...msg, status: 'sent', sentAt: new Date() }
          : msg
      )
    )
  }

  // -------- FILTERS --------
  const scheduledMessages = messages.filter(m => m.status === 'scheduled')
  const sentMessages = messages.filter(m => m.status === 'sent')
  const failedMessages = messages.filter(m => m.status === 'failed')

  return (
    <div>
      <h1>Définir un message</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Destinataire</label>
          <select
            value={selectedContact}
            onChange={e => setSelectedContact(e.target.value)}
            required
          >
            <option value=''>Choisir un contact</option>
            {contacts.map(c => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.phoneE164})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Modèle</label>
          <select
            value={selectedTemplate}
            onChange={e => setSelectedTemplate(e.target.value)}
          >
            <option value=''>Choisir un modèle</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Message</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows='4'
            required
          />
        </div>

        <button type='submit' disabled={loading}>
          {loading ? 'Enregistrement...' : 'Programmer le message'}
        </button>
      </form>

      {/* Futur messages */}
      <h2>Messages programmés</h2>
      {scheduledMessages.length === 0 && <p>Aucun message programmé</p>}
      <ul>
        {scheduledMessages.map(msg => (
          <li key={msg._id}>
            <strong>{msg.recipient.name}</strong> — {msg.content} — <em>Status: {msg.status}</em>
            <br />
            <button onClick={() => sendNow(msg._id)}>Envoyer maintenant</button>
          </li>
        ))}
      </ul>

      {/*historique*/}
      <h2>Historique des messages</h2>
      {sentMessages.length === 0 && <p>Aucun message envoyé</p>}
      <ul>
        {sentMessages.map(msg => (
          <li key={msg._id}>
            <strong>{msg.recipient.name}</strong> — {msg.content} — <em>Status: {msg.status}</em>
            <br />
            Envoyé le {msg.sentAt?.toLocaleString()}
          </li>
        ))}
      </ul>

      {/*erreurs d'envoi*/}
      <h2>Messages échoués</h2>
      {failedMessages.length === 0 && <p>Aucun message échoué</p>}
      <ul>
        {failedMessages.map(msg => (
          <li key={msg._id}>
            <strong>{msg.recipient.name}</strong> — {msg.content} — <em>Status: {msg.status}</em>
            <br />
            Erreur: {msg.errorLog}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default DefineMessage
