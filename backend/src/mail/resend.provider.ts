import { Resend } from 'resend';
import { MailProvider, SendMailOptions, SendMailResult } from './mail.provider';

export class ResendMailProvider implements MailProvider {
  private resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async send(options: SendMailOptions): Promise<SendMailResult> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo,
        scheduledAt: options.scheduledAt,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { success: false, error: message };
    }
  }
}
