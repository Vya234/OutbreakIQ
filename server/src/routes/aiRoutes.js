import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { chat, recommendations } from '../controllers/aiController.js';

const router = Router();

router.post('/chat', asyncHandler(chat));
router.post('/recommendations', asyncHandler(recommendations));

export default router;
