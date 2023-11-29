import express from "express";
import service from "../../controllers/notification.controller.js";

const router = express.Router();

router.get("/:userId", service.getNotifications);

router.patch("/:notificationId", service.markNotificationAsOpened);

export default router;
