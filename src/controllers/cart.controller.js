import factory from "./factory";
import cartService from "../services/cart.service";

const cartController = {
  getAllCarts: factory.getAll(cartService.getAllItem),
  getCart: factory.getById(cartService.getItem),
  addToCart: factory.create(cartService.addItem),
  updateCart: factory.updateById(cartService.updateItem),
  deleteCart: factory.deleteById(cartService.deleteItem),
};

export default cartController;
