import express from 'express';
import upload from '../middleware/upload.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.post('/', upload.array('images', 5), (req, res) => {
  const urls = req.files?.map(f => f.path) || [];
  res.json({ success: true, data: { urls } });
});

export default router;
