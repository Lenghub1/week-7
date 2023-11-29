import notificationService from "../services/notification.service";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    const notifications = await notificationService.getNotifications(userId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const markNotificationAsOpened = async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    const notification =
      await notificationService.markNotificationAsOpened(notificationId);

    res.status(200).json(notification);
  } catch (error) {
    console.error("Error updating notification status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
