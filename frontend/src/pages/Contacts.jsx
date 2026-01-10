import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Still needed for the warning link
import api from '../api/axios';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // WhatsApp Status State
  const [isWhatsappConnected, setIsWhatsappConnected] = useState(true);

  // Form State (To create contacts directly here)
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });

  // 1. Fetch Contacts
  const fetchContacts = async () => {
    try {
      const res = await api.get('/contacts');
      setContacts(res.data);
    } catch (err) {
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Check WhatsApp Status
  const checkWhatsappStatus = async () => {
    try {
      const res = await api.get('/whatsapp/status');
      setIsWhatsappConnected(res.data.connected);
    } catch (err) {
      setIsWhatsappConnected(false);
    }
  };

  // 3. Handle Form Submit
  const handleCreateContact = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    try {
      // Send to backend
      const res = await api.post('/contacts', formData);
      
      // Update UI immediately (add new contact to list)
      setContacts([...contacts, res.data]);
      
      // Reset and hide form
      setFormData({ name: '', phone: '' });
      setShowForm(false);
    } catch (err) {
      console.error("Error creating contact:", err);
      alert("Failed to create contact. Check console.");
    }
  };

  useEffect(() => {
    fetchContacts();
    checkWhatsappStatus();
  }, []);

  return (
    <>
      {/* ⚠️ Warning Banner */}
      {!isWhatsappConnected && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-800 text-center sticky top-0 z-10">
          <p className="font-bold inline-block mr-2">⚠️ WhatsApp Disconnected</p>
          <span className="text-sm">
            Messages cannot be sent. <Link to="/connect" className="underline font-semibold hover:text-yellow-900">Reconnect now</Link>
          </span>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6">
        {/* Header & Toggle Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Contacts</h1>
          
          <button 
            onClick={() => setShowForm(!showForm)}
            className={`px-4 py-2 rounded transition font-medium ${
              showForm 
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {showForm ? 'Cancel' : '+ New Contact'}
          </button>
        </div>

        {/* 📝 INLINE CREATE FORM */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100 mb-8 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Add New Contact</h2>
            <form onSubmit={handleCreateContact} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Alice"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="w-full md:w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. 33612345678"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition">
                Save
              </button>
            </form>
          </div>
        )}

        {/* Contact List */}
        {loading ? (
          <p className="text-gray-500">Loading contacts...</p>
        ) : contacts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-gray-500 mb-4">No contacts found.</p>
            <button onClick={() => setShowForm(true)} className="text-blue-600 font-medium hover:underline">
              Create your first contact
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contacts.map((contact) => (
              <div key={contact._id || contact.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center group hover:shadow-md transition">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{contact.name}</h3>
                  <p className="text-gray-500 font-mono text-sm">{contact.phone || contact.phoneE164}</p>
                </div>
                <div className="text-gray-300 text-2xl group-hover:text-blue-500 transition">👤</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}