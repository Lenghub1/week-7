import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      totalAmount: {
        type: Number,
        required: true,
      },
    },
  ],
  status: {
    type: String,
    enum: [
      "pending",
      "approved",
      "shipped",
      "cancelled",
      "delivered",
      "refunded",
    ],
    default: "pending",
  },
});

const Order = mongoose.model("Order", orderSchema);

Order.findOne({ _id: orderId })
  .populate("addressId")
  .exec(function (err, order) {
    if (err) return handleError(err);
    console.log(order);
  });

export default Order;
