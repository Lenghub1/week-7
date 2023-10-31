const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['buyerPurchase', 'sellerUpdate', 'adminNotification'],
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product',
  },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
