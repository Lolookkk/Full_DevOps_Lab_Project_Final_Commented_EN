import { useEffect, useState } from 'react';
import QRCode from "react-qr-code";
import api from '../api/axios';

export default function ConnectWhatsapp() {
  const [status, setStatus] = useState({ connected: false, qrCode: null });
  const [loading, setLoading] = useState(true);
  
  // New state for pairing code
  const [usePairingCode, setUsePairingCode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [generatedCode, setGeneratedCode] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/whatsapp/status');
      setStatus(res.data);
      setLoading(false);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    try {
      // Send number to backend (remove '+' if present)
      const cleanNumber = phoneNumber.replace('+', '');
      const res = await api.post('/whatsapp/pair', { phoneNumber: cleanNumber });
      setGeneratedCode(res.data.code);
    } catch (err) {
      alert("Error generating code: " + (err.response?.data?.details || err.message));
    }
  };

  if (status.connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-green-100 text-green-800 p-8 rounded-xl text-center">
          <h1 className="text-3xl mb-2">✅ Connected!</h1>
          <p>WhatsApp is linked and ready.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h1 className="text-2xl font-bold text-center mb-6">Connect WhatsApp</h1>

      {/* Toggle Tabs */}
      <div className="flex mb-6 border-b">
        <button 
          className={`flex-1 pb-2 ${!usePairingCode ? 'border-b-2 border-blue-600 font-bold' : 'text-gray-500'}`}
          onClick={() => setUsePairingCode(false)}
        >
          Scan QR
        </button>
        <button 
          className={`flex-1 pb-2 ${usePairingCode ? 'border-b-2 border-blue-600 font-bold' : 'text-gray-500'}`}
          onClick={() => setUsePairingCode(true)}
        >
          Use Code
        </button>
      </div>

      {!usePairingCode ? (
        /* QR VIEW */
        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-500 mb-4">Settings &gt; Linked Devices &gt; Link a Device</p>
          <div className="p-2 border rounded-lg">
             {status.qrCode ? <QRCode value={status.qrCode} size={200} /> : <p>Loading QR...</p>}
          </div>
        </div>
      ) : (
        /* PAIRING CODE VIEW */
        <div className="flex flex-col items-center">
          {!generatedCode ? (
            <form onSubmit={handleRequestCode} className="w-full">
              <p className="text-sm text-gray-500 mb-2">Enter your phone number (with country code)</p>
              <input 
                type="text" 
                placeholder="e.g. 33612345678" 
                className="w-full p-2 border rounded mb-3 outline-none focus:ring-2 focus:ring-blue-500"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
              />
              <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Get Code
              </button>
            </form>
          ) : (
            <div className="text-center w-full">
              <p className="text-gray-600 mb-2">Enter this code on your phone:</p>
              <div className="bg-gray-100 text-4xl font-mono tracking-widest p-4 rounded-lg font-bold select-all">
                {generatedCode}
              </div>
              <p className="text-xs text-gray-400 mt-4">Go to Linked Devices &gt; Link with phone number</p>
              <button 
                onClick={() => setGeneratedCode(null)} 
                className="text-blue-500 text-sm mt-4 underline"
              >
                Try different number
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}