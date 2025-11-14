import { db } from "./db";
import { telegramOtps } from "@shared/schema";
import { eq } from "drizzle-orm";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via Telegram
export async function sendOTP(chatId: string, phoneNumber: string): Promise<string> {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store OTP in database
  await db.insert(telegramOtps).values({
    phoneNumber,
    otp,
    telegramChatId: chatId,
    expiresAt,
  }).onConflictDoUpdate({
    target: telegramOtps.phoneNumber,
    set: {
      otp,
      telegramChatId: chatId,
      expiresAt,
      verified: false,
      createdAt: new Date(),
    },
  });

  // Send OTP via Telegram
  const message = `🔐 Your DATA4ME verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this message.`;
  
  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    throw new Error('Failed to send OTP via Telegram');
  }

  return otp;
}

// Verify OTP
export async function verifyOTP(phoneNumber: string, otp: string): Promise<boolean> {
  const [record] = await db
    .select()
    .from(telegramOtps)
    .where(eq(telegramOtps.phoneNumber, phoneNumber));

  if (!record) {
    return false;
  }

  if (record.otp !== otp) {
    return false;
  }

  if (new Date() > record.expiresAt) {
    return false;
  }

  if (record.verified) {
    return false; // Already used
  }

  // Mark as verified
  await db
    .update(telegramOtps)
    .set({ verified: true })
    .where(eq(telegramOtps.phoneNumber, phoneNumber));

  return true;
}

// Setup webhook for Telegram bot
export function setupTelegramWebhook(app: any) {
  // Handle incoming messages from Telegram bot
  app.post('/api/telegram/webhook', async (req: any, res: any) => {
    try {
      const update = req.body;

      if (update.message && update.message.text === '/start') {
        const chatId = update.message.chat.id.toString();
        const welcomeMessage = `Welcome to DATA4ME! 🎉\n\nTo verify your phone number during registration, we'll send you a 6-digit OTP code here.\n\nPlease complete your registration on our website and we'll send your verification code automatically.`;

        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeMessage,
          }),
        });
      }

      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Telegram webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}

// Request OTP for a phone number (to be called when user clicks "I've started the bot")
export async function requestOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
  // Check if there's a recent OTP request for this number
  const [existing] = await db
    .select()
    .from(telegramOtps)
    .where(eq(telegramOtps.phoneNumber, phoneNumber));

  if (!existing || !existing.telegramChatId) {
    return {
      success: false,
      message: 'Please start the Telegram bot first by sending /start',
    };
  }

  // Send new OTP
  await sendOTP(existing.telegramChatId, phoneNumber);

  return {
    success: true,
    message: 'OTP sent to your Telegram',
  };
}
