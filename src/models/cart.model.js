import mongoose from "mongoose";
import Product from "./product.model";

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
    },
  ],
  totalAmount: {
    type: Number,
  },
});

cartSchema.pre("save", async function (next) {
  try {
    const cart = this;
    let totalAmount = 0;
    for (let i = 0; i < cart.items.length; i++) {
      const product = await Product.findById(cart.items[i].productId);
      if (!product) {
        throw new Error("Product not found");
      }
      totalAmount += product.unitPrice * cart.items[i].quantity;
    }
    cart.totalAmount = totalAmount;
    next();
  } catch (error) {
    next(error);
  }
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
