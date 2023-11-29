import Order from "../models/order.model.js";

const orderService = {
  async getAllItems() {
    const products = await Order.find({});
    if (!products) {
      throw new Error({ status: 404, message: "No product found" });
    }
    return products;
  },
  async getItem(itemId) {
    const product = await Order.findById(itemId);
    if (!product) {
      throw new Error({ status: 404, message: "No product found" });
    }
    return product;
  },
  async updateItem(itemId, itemBody) {
    const product = await Order.findByIdAndUpdate(itemId, itemBody);
    if (!product) {
      throw new Error({ status: 404, message: "No product found" });
    }
    return product;
  },
  async deleteItem(itemId) {
    const product = await Order.findByIdAndDelete(itemId);
    if (!product) {
      throw new Error({ status: 404, message: "No product found" });
    }
    return product;
  },
  async addItem(itemBody) {
    const product = await Order.create(itemBody);
    if (!product) {
      throw new Error({ status: 404, message: "No product found" });
    }
    return product;
  },
};

export default orderService;
