const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    To: { type: Schema.Types.ObjectId, ref: 'User' },
    From: { type: Schema.Types.ObjectId, ref: 'User' },
    notificationType: String,
    opened: { type: Boolean, default: false },
    entityId: Schema.Types.ObjectId
}, { timestamps: true });

NotificationSchema.statics.insertNotification = async (To, From, notificationType, entityId) => {
    let data = {
        To: To,
        From: From,
        notificationType: notificationType,
        entityId: entityId
    };
    await Notification.deleteOne(data).catch(error => console.log(error));
    return Notification.create(data).catch(error => console.log(error));
}
const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;


/* example:

 const To = 'buyerUserId'; 
 const From = 'sellerUserId'; 
 const notificationType = 'purchase';
 const entityId = 'productId';

// Call the insertNotification method to create a notification

 await Notification.insertNotification(To, From, notificationType, entityId);

 data will look like:
 {
    To: buyerUserId,     
    From: sellerUserId,  
    notificationType: 'purchase',
    opened: false
    entityId: productObjectId 
}

*/