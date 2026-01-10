import { useState, useEffect } from "react";
import QRCode from "react-qr-code";

export default function ConnectWhatsapp() {
  const [status, setStatus] = useState("initializing");
  const [qrCode, setQrCode] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/whatsapp/status");
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status);
          setQrCode(data.qr);
        }
      } catch (err) {
        console.error("Erreur status whatsapp", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Connexion WhatsApp</h1>
      <p>Status: <strong>{status}</strong></p>

      {status === "qr_ready" && qrCode && (
        <div style={{ background: "white", padding: "16px", display: "inline-block" }}>
          <QRCode value={qrCode} />
          <p>Scannez ce code avec WhatsApp sur votre téléphone</p>
        </div>
      )}

      {status === "connected" && (
        <div style={{ color: "green" }}>
          <h2>✅ WhatsApp est connecté !</h2>
        </div>
      )}
    </div>
  );
}