import express from "express";
import {
  getNotifications,
  markNotificationAsOpened,
} from "../../controllers/notification.controller.js";

const router = express.Router();

router.get("/notifications/:userId", getNotifications);

router.patch("/notifications/:notificationId", markNotificationAsOpened);

export default router;
