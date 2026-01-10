import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Fetch contacts on load
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/contacts');
      setContacts(res.data);
    } catch (err) {
      console.error("Error fetching contacts", err);
    }
  };

  const addContact = async (e) => {
    e.preventDefault();
    try {
      await api.post('/contacts', { name: newName, phoneE164: newPhone });
      fetchContacts(); // Refresh list
      setNewName(''); setNewPhone('');
    } catch (err) {
      alert("Error adding contact");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Contacts</h1>
      
      {/* Add Contact Form */}
      <form onSubmit={addContact} className="mb-8 flex gap-2">
        <input className="border p-2 rounded" placeholder="Name" value={newName} onChange={e => setNewName(e.target.value)} />
        <input className="border p-2 rounded" placeholder="+336..." value={newPhone} onChange={e => setNewPhone(e.target.value)} />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Add</button>
      </form>

      {/* Contacts List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contacts.map(contact => (
          <div key={contact._id} className="p-4 border rounded shadow bg-white">
            <h3 className="font-bold">{contact.name}</h3>
            <p className="text-gray-600">{contact.phoneE164}</p>
          </div>
        ))}
      </div>
    </div>
  );
}