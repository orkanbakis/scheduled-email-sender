import pool from '../config/database';
import { encrypt } from './encryption.service';
import { createMailProvider } from '../mail/mail.factory';
import { teaserTemplate } from '../mail/templates/teaser';
import { scheduledTemplate } from '../mail/templates/scheduled';
import { config } from '../config';

interface ScheduleEmailParams {
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
  scheduledAt: string;
}

interface ScheduleEmailResult {
  id: string;
  countdownUrl: string;
  scheduledAt: string;
}

export async function scheduleEmail(params: ScheduleEmailParams): Promise<ScheduleEmailResult> {
  const { senderName, senderEmail, recipientEmail, subject, body, scheduledAt } = params;
  const mailProvider = createMailProvider();

  // 1. Encrypt content
  const { ciphertext, iv, tag } = encrypt(JSON.stringify({ subject, body }));

  // 2. Insert row (status: pending)
  const insertResult = await pool.query(
    `INSERT INTO scheduled_emails
       (sender_name, sender_email, recipient_email, encrypted_content, encryption_iv, encryption_tag, scheduled_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [senderName, senderEmail, recipientEmail, ciphertext, iv, tag, scheduledAt],
  );
  const id: string = insertResult.rows[0].id;

  // 3. Build countdown URL
  const countdownUrl = `${config.appUrl}/countdown/${id}`;

  // 4. Send teaser email immediately (best-effort)
  try {
    await mailProvider.send({
      to: recipientEmail,
      from: config.fromEmail,
      subject: `${senderName} has a future message for you`,
      html: teaserTemplate({ senderName, countdownUrl, scheduledAt }),
      replyTo: senderEmail,
    });
  } catch (err) {
    console.error('Teaser email failed:', err);
  }

  // 5. Schedule actual email via Resend
  const result = await mailProvider.send({
    to: recipientEmail,
    from: config.fromEmail,
    subject,
    html: scheduledTemplate({ senderName, subject, body }),
    replyTo: senderEmail,
    scheduledAt,
  });

  if (!result.success) {
    await pool.query(
      `UPDATE scheduled_emails SET status = 'failed', failure_reason = $2, updated_at = NOW()
       WHERE id = $1`,
      [id, result.error],
    );
    throw Object.assign(new Error('Failed to schedule email with provider'), { statusCode: 500 });
  }

  // 6. Update with Resend message ID
  await pool.query(
    `UPDATE scheduled_emails
     SET resend_email_id = $2, status = 'scheduled', scheduled_at_resend = NOW(), updated_at = NOW()
     WHERE id = $1`,
    [id, result.messageId],
  );

  // 7. Return result
  return { id, countdownUrl, scheduledAt };
}

export async function getEmail(id: string) {
  const result = await pool.query(
    `SELECT id, sender_name, scheduled_at, status FROM scheduled_emails WHERE id = $1`,
    [id],
  );

  if (result.rows.length === 0) {
    throw Object.assign(new Error('Not found'), { statusCode: 404 });
  }

  const row = result.rows[0];
  return {
    id: row.id,
    senderName: row.sender_name,
    scheduledAt: row.scheduled_at,
    status: row.status,
    expired: new Date() >= new Date(row.scheduled_at),
  };
}
