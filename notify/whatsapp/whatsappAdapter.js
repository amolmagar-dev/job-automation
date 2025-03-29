import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

let client = null;
let isReady = false;

export async function initWhatsAppClient() {
  return new Promise((resolve, reject) => {
    client = new Client({
      authStrategy: new LocalAuth()
    });

    client.on('qr', qr => {
      console.log('📱 Scan this QR code to authenticate:');
      qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
      console.log('✅ WhatsApp bot is ready!');
      isReady = true;
      resolve();
    });

    client.on('auth_failure', msg => {
      console.error('❌ Auth failed:', msg);
      reject(msg);
    });

    client.initialize();
  });
}


export async function sendWhatsAppMessage(message) {
  if (!isReady || !client ||!process.env.NOTIFY_WHATSAPP_ENABLED) {
  }

  const chatId = `${process.env.NOTIFY_TO}@c.us`;
  try {
    await client.sendMessage(chatId, message);
    console.log(`📤 Message sent to ${chatId}`);
  } catch (err) {
    console.error(`❌ Failed to send message to ${chatId}:`, err.message);
    throw err;
  }
}
