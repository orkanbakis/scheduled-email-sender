import { Router } from 'express';
import express from 'express';
import { handleResendWebhook } from '../controllers/webhook.controller';

const router = Router();

// Use raw body for webhook signature verification
router.use(express.raw({ type: 'application/json' }));

router.post('/resend', handleResendWebhook);

export default router;
