import mongoose from "mongoose";
import Product from "./product.model";

const orderManageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
});

orderManageSchema.pre("save", async function (next) {
  this.items.map(async (item) => ({
    product: {
      productId: await Product.findById(item.product),
    },
    quantity: item.quantity,
  })),
    console.log(this.items);
  next();
});

const OrderManage = mongoose.model("OrderManage", orderManageSchema);
export default OrderManage;
