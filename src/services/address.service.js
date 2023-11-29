import Address from "../models/address.model.js";

const addressService = {
  async getAllAddresses() {
    const address = await Address.find({});
    if (!address) {
      throw new Error({ status: 404, message: "Address cannot be created." });
    }
    return address;
  },
  async getAddress(addressId) {
    const address = await Address.findById(addressId);
    if (!address) {
      throw new Error({ status: 404, message: "Address cannot be created." });
    }
    return address;
  },
  async updateAddress(addressId, body) {
    const address = await Address.findByIdAndUpdate(addressId, body);
    if (!address) {
      throw new Error({ status: 404, message: "Address cannot be created." });
    }
    return address;
  },
  async deleteAddress(addressId) {
    const address = await Address.findByIdAndDelete(addressId);
    if (!address) {
      throw new Error({ status: 404, message: "Address cannot be created." });
    }
    return address;
  },
  async createAddress(body) {
    const address = await Address.create(body);
    if (!address) {
      throw new Error({ status: 404, message: "Address cannot be created." });
    }
    return address;
  },
};

export default addressService;
