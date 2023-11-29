import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

const orderService = {
  async getAllItems() {
    const orders = await Order.find({});
    if (!orders) {
      throw new Error({ status: 404, message: "No product found" });
    }
    return orders;
  },
  async getItem(itemId) {
    const order = await Order.findById(itemId);
    if (!order) {
      throw new Error({ status: 404, message: "No product found" });
    }
    return order;
  },
  async updateItem(itemId, itemBody) {
    const order = await Order.findByIdAndUpdate(itemId, itemBody);
    if (!order) {
      throw new Error({ status: 404, message: "No product found" });
    }
    return order;
  },
  async deleteItem(itemId) {
    const order = await Order.findByIdAndDelete(itemId);
    if (!order) {
      throw new Error({ status: 404, message: "No product found" });
    }
    return order;
  },
  async addItem(itemBody) {
    const cartItemsWithDetails = await Promise.all(
      itemBody.cartItems.map(async (cartItem) => {
        const product = await Product.findById(cartItem.productId);
        return {
          ...cartItem,
          itemPrice: product.unitPrice,
          totalPrice: product.unitPrice * cartItem.quantity,
        };
      })
    );
    const totalPrice = cartItemsWithDetails.reduce(
      (total, cartItem) => total + cartItem.quantity * cartItem.itemPrice,
      0
    );

    itemBody.totalPrice = totalPrice.toFixed(2);

    const order = await Order.create(itemBody);
    if (!order) {
      throw new Error({ status: 404, message: "No product found" });
    }
    return order;
  },
};

export default orderService;
