import { Request, Response, NextFunction } from 'express';
import { Webhook } from 'svix';
import pool from '../config/database';
import { config } from '../config';

export async function handleResendWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const wh = new Webhook(config.resendWebhookSecret);

    const svixId = req.headers['svix-id'];
    const svixTimestamp = req.headers['svix-timestamp'];
    const svixSignature = req.headers['svix-signature'];

    if (!svixId || !svixTimestamp || !svixSignature) {
      res.status(400).json({ error: 'Missing svix headers' });
      return;
    }

    const payload = wh.verify(req.body.toString(), {
      'svix-id': svixId as string,
      'svix-timestamp': svixTimestamp as string,
      'svix-signature': svixSignature as string,
    }) as { type: string; data: { email_id?: string; reason?: string } };

    switch (payload.type) {
      case 'email.delivered':
        await pool.query(
          `UPDATE scheduled_emails
           SET status = 'delivered', delivered_at = NOW(), updated_at = NOW()
           WHERE resend_email_id = $1`,
          [payload.data.email_id],
        );
        break;

      case 'email.bounced':
        await pool.query(
          `UPDATE scheduled_emails
           SET status = 'failed', failure_reason = $2, updated_at = NOW()
           WHERE resend_email_id = $1`,
          [payload.data.email_id, payload.data.reason ?? 'Bounced'],
        );
        break;
    }

    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
}
