import express from 'express';
import { createCampaign, getCampaigns, updateCampaignStatus } from '../controllers/campaign.controller.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/api/campaigns', auth, createCampaign);
router.post('/api/campaigns/update', auth, updateCampaignStatus);
router.get('/api/campaigns', auth, getCampaigns);

export default router;