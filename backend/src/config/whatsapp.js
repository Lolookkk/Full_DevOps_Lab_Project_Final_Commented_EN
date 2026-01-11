import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
const { Client, LocalAuth } = pkg;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu']
  }
});

let qrCodeData = null;
let isConnected = false;
let pairingCode = null; // Store the text code here

client.on('qr', (qr) => {
  qrCodeData = qr;
  isConnected = false;
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('[whatsapp] connected');
  isConnected = true;
  qrCodeData = null;
  pairingCode = null; // Clear code on success
});

client.on('authenticated', () => {
  console.log('[whatsapp] Authenticated');
});

// NEW Function: Request a pairing code
export const requestPairing = async (phoneNumber) => {
  try {
    // Ensure the client is ready to accept a code request
    // This returns the code (e.g., "ABC-123") directly
    const code = await client.requestPairingCode(phoneNumber);
    pairingCode = code;
    return code;
  } catch (error) {
    console.error('Failed to request pairing code:', error);
    throw error;
  }
};

export const getWhatsappStatus = () => {
  return {
    connected: isConnected,
    qrCode: qrCodeData,
    pairingCode: pairingCode // Send this to frontend
  };
};

// Initialize only once
client.initialize();

export default client;