import Cart from "../models/cart.model";

const cartService = {
  async getAllItem() {
    const products = await Cart.find({});
    if (!products) {
      throw new Error({ status: 404, message: "No products in your cart." });
    }
    return products;
  },

  async getItem(itemId) {
    const product = await Cart.findById(itemId);
    if (!product) {
      throw new Error({ status: 404, message: "No products in your cart." });
    }
    return product;
  },

  async addToCart(itemBody) {
    const product = await Cart.create(itemBody);
    if (!product) {
      throw new Error({ status: 404, message: "No products in your cart." });
    }
    return product;
  },
  async updateCart(itemId, itemBody) {
    const product = await Cart.findByIdAndUpdate(itemId, itemBody);
    if (!product) {
      throw new Error({ status: 404, message: "No products in your cart." });
    }
    return product;
  },
  async deleteCart(itemId, itemBody) {
    const product = await Cart.findByIdAndDelete(itemId, itemBody);
    if (!product) {
      throw new Error({ status: 404, message: "No products in your cart." });
    }
    return product;
  },
};
