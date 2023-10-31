import mongoose from "mongoose"

const orderManageSchema = new mongoose.Schema({
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }]
});

orderManageSchema.pre('save', async function(next) {
    // 'this' refers to the order document that is being saved
    const order = this;

    const update = order.item.map(async item => {
        const product = await mongoose.model('Product').findById(item.productId);

        if (!product) {
            throw new Error('Product not found');
          }
      
          if (product.quantity < item.quantity) {
            throw new Error('Not enough stock for product');
          }
      
          product.quantity -= item.quantity;
          return product.save();
        });
  
        await Promise.all(updatePromises);
      
        next();
})

const OrderManage = mongoose.model("OrderManage", orderManageSchema);
export default OrderManage;