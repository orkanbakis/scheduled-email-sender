import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as emailService from '../services/email.service';

export const createEmailSchema = z.object({
  senderName: z.string().min(1).max(255),
  senderEmail: z.string().email(),
  recipientEmail: z.string().email(),
  subject: z.string().min(1).max(255),
  body: z.string().min(1).max(10000),
  scheduledAt: z.string().datetime().refine(
    (v) => new Date(v) > new Date(Date.now() + 5 * 60 * 1000),
    { message: 'Must be at least 5 minutes in the future' },
  ),
});

export async function createEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await emailService.scheduleEmail(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id;
    const result = await emailService.getEmail(Array.isArray(id) ? id[0] : id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
