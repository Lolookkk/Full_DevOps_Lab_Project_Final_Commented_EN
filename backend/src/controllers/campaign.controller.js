import Campaign from '../models/campaign.model.js'

export const createCampaign = async (req, res, next) => {
  try {
    const { name, description, contacts, messageTemplate, scheduledDate } = req.body

    const newCampaign = await Campaign.create({
      name,
      description,
      creator: req.userId,
      contacts,
      messageTemplate,
      scheduledDate,
      status: 'scheduled'
    })

    res.status(201).json(newCampaign)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Failed',
        details: error.message
      })
    }
    next(error)
  }
}

export const getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find({ creator: req.userId })
    res.json(campaigns)
  } catch (error) {
    next(error)
  }
}

export const updateCampaignStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const updatedCampaign = await Campaign.findOneAndUpdate(
      { _id: id, creator: req.userId },
      { status },
      { new: true }
    )

    res.json(updatedCampaign)
  } catch (error) {
    next(error)
  }
}
