import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN ?? false as const,
  databaseUrl: process.env.DATABASE_URL!,
  encryptionKey: process.env.ENCRYPTION_KEY!,
  resendApiKey: process.env.RESEND_API_KEY!,
  resendWebhookSecret: process.env.RESEND_WEBHOOK_SECRET!,
  fromEmail: process.env.FROM_EMAIL!,
  appUrl: process.env.APP_URL!,
  mailProvider: process.env.MAIL_PROVIDER ?? 'resend',
};
