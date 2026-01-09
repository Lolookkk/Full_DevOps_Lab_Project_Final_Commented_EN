export const handleWhatsAppWebhook = async (req, res, next) => {
  try {
    const { messageId, status, timestamp } = req.body;

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { status, sentAt: timestamp || new Date() },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: "Message non trouvé" });
    }

    console.log(`[Webhook] Message ${messageId} mis à jour : ${status}`);
    res.status(200).json({ received: true, data: updatedMessage });
  } catch (error) {
    next(error);
  }
};