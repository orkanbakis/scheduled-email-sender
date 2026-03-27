export interface CreateEmailPayload {
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
  scheduledAt: string;
}

export interface ScheduleEmailResponse {
  id: string;
  countdownUrl: string;
  scheduledAt: string;
}

export interface EmailMetadata {
  id: string;
  senderName: string;
  scheduledAt: string;
  status: 'pending' | 'scheduled' | 'delivered' | 'failed';
  expired: boolean;
}
