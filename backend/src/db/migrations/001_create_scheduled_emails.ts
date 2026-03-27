import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TYPE email_status AS ENUM ('pending', 'scheduled', 'delivered', 'failed');

    CREATE TABLE scheduled_emails (
        id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_name           VARCHAR(255) NOT NULL,
        sender_email          VARCHAR(255) NOT NULL,
        recipient_email       VARCHAR(255) NOT NULL,
        encrypted_content     TEXT NOT NULL,
        encryption_iv         TEXT NOT NULL,
        encryption_tag        TEXT NOT NULL,
        scheduled_at          TIMESTAMPTZ NOT NULL,
        resend_email_id       VARCHAR(255),
        status                email_status NOT NULL DEFAULT 'pending',
        scheduled_at_resend   TIMESTAMPTZ,
        delivered_at          TIMESTAMPTZ,
        failure_reason        TEXT,
        created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_scheduled_emails_resend_id
        ON scheduled_emails (resend_email_id);
  `);
}
