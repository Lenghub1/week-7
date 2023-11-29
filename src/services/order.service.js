import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

const orderService = {
  async getAllOrders() {
    const orders = await Order.find({});
    if (!orders) {
      throw new Error({ status: 404, message: "Order not found." });
    }
    return orders;
  },
  async getOrder(orderId) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error({ status: 404, message: "Order not found." });
    }
    return order;
  },
  async updateOrder(orderId, orderBody) {
    const order = await Order.findByIdAndUpdate(orderId, orderBody);
    if (!order) {
      throw new Error({ status: 404, message: "Order not found." });
    }
    return order;
  },
  async deleteOrder(orderId) {
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      throw new Error({ status: 404, message: "Order not found." });
    }
    return order;
  },
  async createOrder(orderBody) {
    const cartItemsWithDetails = await Promise.all(
      orderBody.cartItems.map(async (cartItem) => {
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

    orderBody.totalPrice = totalPrice.toFixed(2);

    const order = await Order.create(orderBody);
    if (!order) {
      throw new Error({ status: 404, message: "Order not found." });
    }
    return order;
  },
};

export default orderService;
