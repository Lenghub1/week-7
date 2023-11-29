import factory from "./factory.js";
import orderService from "../services/order.service.js";

const orderController = {
  getAllOrder: factory.getAll(orderService.getAllItems),
  getOrder: factory.getById(orderService.getItem),
  addOrder: factory.create(orderService.addItem),
  updateOrder: factory.updateById(orderService.updateItem),
  deleteOrder: factory.deleteById(orderService.deleteItem),
};

export default orderController;
