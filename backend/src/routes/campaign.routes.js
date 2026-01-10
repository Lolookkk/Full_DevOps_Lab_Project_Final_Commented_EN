import express from 'express'
import { createCampaign, getCampaigns, updateCampaignStatus } from '../controllers/campaign.controller.js'

const router = express.Router()

router.post('/api/campaigns', createCampaign)
router.post('/api/campaigns/update', updateCampaignStatus)
router.get('/api/campaigns', getCampaigns)

export default router
