import express from 'express';
import { createCampaign, getCampaigns } from '../controllers/campaign.controller.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/api/campaigns', auth, createCampaign);
router.get('/api/campaigns', auth, getCampaigns);

export default router;