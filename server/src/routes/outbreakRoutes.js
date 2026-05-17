import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateOutbreakBody } from '../middleware/validateOutbreak.js';
import {
  listOutbreaks,
  getOutbreak,
  createOutbreak,
  updateOutbreak,
  deleteOutbreak,
  getStats,
  downloadReport,
} from '../controllers/outbreakController.js';

const router = Router();

router.get('/stats', asyncHandler(getStats));
router.get('/report/pdf', asyncHandler(downloadReport));
router.get('/', asyncHandler(listOutbreaks));
router.get('/:id', asyncHandler(getOutbreak));
router.post('/', validateOutbreakBody, asyncHandler(createOutbreak));
router.put('/:id', validateOutbreakBody, asyncHandler(updateOutbreak));
router.delete('/:id', asyncHandler(deleteOutbreak));

export default router;
