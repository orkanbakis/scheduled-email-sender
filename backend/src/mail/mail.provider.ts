export interface SendMailOptions {
  to: string;
  from: string;
  subject: string;
  html: string;
  replyTo?: string;
  scheduledAt?: string; // ISO 8601
}

export interface SendMailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface MailProvider {
  send(options: SendMailOptions): Promise<SendMailResult>;
}
