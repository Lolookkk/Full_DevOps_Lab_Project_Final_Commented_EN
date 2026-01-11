// src/pages/Events.jsx
import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Events() {
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({ contactId: '', type: 'birthday', date: '', label: '' });

  useEffect(() => {
    api.get('/contacts').then(res => setContacts(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', formData);
      alert('Event Scheduled Successfully! 🎉');
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Decorative */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 md:w-1/3 p-8 text-white flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-4">Schedule Event</h2>
            <p className="opacity-90">Plan your automated messages so you never miss a special moment.</p>
          </div>
          <div className="text-8xl opacity-20 mt-8 md:mt-0">📅</div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:w-2/3">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* Contact Selector */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Who is this for?</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                onChange={e => setFormData({...formData, contactId: e.target.value})}
              >
                <option value="">Select a Contact...</option>
                {contacts.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phoneE164})</option>)}
              </select>
            </div>

            {/* Event Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Event Type</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="birthday">🎂 Birthday</option>
                  <option value="marriage">💍 Marriage</option>
                  <option value="custom">📝 Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                <input 
                  type="date" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </div>

            {/* Label Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Event Label (or Custom Message)</label>
              <input 
                type="text" 
                placeholder="e.g. 30th Birthday Party!"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                onChange={e => setFormData({...formData, label: e.target.value})}
              />
            </div>

            {/* Submit Button */}
            <button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-md transition transform active:scale-95">
              Save Event
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}