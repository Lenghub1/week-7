import service from "../services/user.service.js";
import factory from "./factory.js";

const userController = {
  getAllUsers: factory.getAll(service.getAllUser),
};

export default userController;
