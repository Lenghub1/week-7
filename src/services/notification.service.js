import Notification from "../models/notification.model.js";

class NotificationService {
  async getNotifications(userId) {
    try {
      const notifications = await Notification.find({ To: userId })
        .sort({ createdAt: -1 })
        .exec();
      return notifications;
    } catch (error) {
      throw new Error("Error getting notifications");
    }
  }

  async markNotificationAsOpened(notificationId) {
    try {
      const notification = await Notification.findById(notificationId);

      if (!notification) {
        throw new Error("Notification not found");
      }

      notification.opened = true;
      await notification.save();

      return notification;
    } catch (error) {
      throw new Error("Error updating notification status");
    }
  }
}

export default new NotificationService();
