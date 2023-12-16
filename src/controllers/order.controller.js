import factory from "./factory.js";
import orderService from "@/services/order.service.js";

const orderController = {
  getAllOrder: factory.getAll(orderService.getAllOrders),
  getOrder: factory.getById(orderService.getOrder),
  addOrder: factory.create(orderService.createOrder),
  updateOrder: factory.updateById(orderService.updateOrder),
  userUpdateOrder: factory.updateById(orderService.userUpdateOrder),
  deleteOrder: factory.deleteById(orderService.deleteOrder),
  getSellerOrder: factory.getAll(orderService.getSellerOrder),
};

export default orderController;
