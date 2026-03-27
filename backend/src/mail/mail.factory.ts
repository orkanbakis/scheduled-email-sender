import { MailProvider } from './mail.provider';
import { ResendMailProvider } from './resend.provider';

export function createMailProvider(): MailProvider {
  const provider = process.env.MAIL_PROVIDER ?? 'resend';

  switch (provider) {
    case 'resend':
      return new ResendMailProvider(process.env.RESEND_API_KEY!);
    default:
      throw new Error(`Unknown mail provider: ${provider}`);
  }
}
