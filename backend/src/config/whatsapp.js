import pkg from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal'
const { Client, LocalAuth } = pkg

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: false,
    args: ['--no-sandbox']
  }
})

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true })
  console.log('Scannez ce QR code pour connecter votre numéro WhatsApp !')
})

client.on('ready', () => {
  console.log('[whatsapp] connected')
})

client.on('auth_failure', msg => {
  console.error('Échec d’authentification :', msg)
})

client.initialize().catch(err => console.error('Erreur init WhatsApp:', err))

console.log('[whatsapp] initialise')

export default client
