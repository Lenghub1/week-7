import mongoose from "mongoose";

const productSchema = new mongoose.schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  title: {
    type: String,
    required: true,
    min: 3,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const orderHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderDate: {
    type: Date,
    required: true,
  },
  items: [
    {
      product: productSchema,
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
});

const OrderHistory = mongoose.model("Order-History", orderHistorySchema);
export default OrderHistory;
