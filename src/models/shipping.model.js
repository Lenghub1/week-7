import mongoose from "mongoose";
import Address from "./address.model";

const shippingSchema = new mongoose.Schema({
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },
  method: {
    type: String,
    required: true,
  },
  trackingNumber: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "approved",
      "shipped",
      "cancelled",
      "delivered",
      "refunded",
    ],
    default: "pending",
  },
});

const Shipping = mongoose.model("Shipping", shippingSchema);
export default Shipping;
