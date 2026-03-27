import { CreateEmailPayload, ScheduleEmailResponse, EmailMetadata } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function scheduleEmail(payload: CreateEmailPayload): Promise<ScheduleEmailResponse> {
  const res = await fetch(`${BASE_URL}/api/emails`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Failed to schedule email');
  }

  return res.json();
}

export async function getEmail(id: string): Promise<EmailMetadata> {
  const res = await fetch(`${BASE_URL}/api/emails/${encodeURIComponent(id)}`);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Failed to fetch email');
  }

  return res.json();
}
