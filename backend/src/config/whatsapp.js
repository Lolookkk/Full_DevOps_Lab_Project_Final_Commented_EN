import pkg from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal'
const { Client, LocalAuth } = pkg

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox']
  }
})

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true })
  console.log('Scan this QR code to connect to your WhatsApp')
})

client.on('ready', () => {
  console.log('[whatsapp] connected')
})

client.on('auth_failure', msg => {
  console.error('Authentication failure: ', msg)
})

client.initialize().catch(err => console.error('Erreur initialize WhatsApp: ', err))

console.log('[whatsapp] initialized')

export default client
