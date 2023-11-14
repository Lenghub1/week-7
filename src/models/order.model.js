import mongoose from "mongoose";
import Cart from "./cart.model";
import Payment from "./payment.model";

const orderSchema = new mongoose.Schema(
  {
    cart: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart",
        required: true,
      },
    ],
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    shipping: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipping",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
orderSchema.pre("save", async function (next) {
  this.cart = await Cart.findById(this.cart);
  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
