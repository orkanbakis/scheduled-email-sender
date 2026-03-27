import { Router } from 'express';
import { validate } from '../middleware/validate';
import { createEmailSchema, createEmail, getEmail } from '../controllers/email.controller';

const router = Router();

router.post('/', validate(createEmailSchema), createEmail);
router.get('/:id', getEmail);

export default router;
