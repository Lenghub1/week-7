import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  title: {
    type: String,
    required: true,
    unique: true,
    min: 3,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const orderManageSchema = new mongoose.Schema({
  items: [
    {
      product: productSchema,
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
});

orderManageSchema.post("save", async function (next) {
  const order = this;

  const update = order.items.map(async (item) => {
    const product = await mongoose.model("Product").findById(item.productId);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.quantity < item.quantity) {
      throw new Error("Not enough stock for product");
    }

    product.quantity -= item.quantity;
    return product.save();
  });

  await Promise.all(update);

  next();
});

const OrderManage = mongoose.model("OrderManage", orderManageSchema);
export default OrderManage;
