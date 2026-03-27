import { Router } from 'express';
import express from 'express';

const router = Router();

// Use raw body for webhook signature verification
router.use(express.raw({ type: 'application/json' }));

// Webhook handler will be added in Phase 3

export default router;
