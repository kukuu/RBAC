//Template Routes
//...............

// src/routes/templateRoutes.ts
import { Router } from 'express';
import { getTemplates } from '../controllers/templateController';
import { authorize } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authorize(['user', 'admin']), getTemplates);

export default router;
