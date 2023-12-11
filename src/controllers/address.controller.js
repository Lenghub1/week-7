import factory from "./factory.js";
import addressService from "@/services/address.service.js";

const addressController = {
  getAllAddresses: factory.getAll(addressService.getAllAddresses),
  getAddress: factory.getById(addressService.getAddress),
  createAddress: factory.create(addressService.createAddress),
  updateAddress: factory.updateById(addressService.updateAddress),
  deleteAddress: factory.deleteById(addressService.deleteAddress),
};

export default addressController;
