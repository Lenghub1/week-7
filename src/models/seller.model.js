import mongoose from "mongoose";
import User from "./user.model.js";

const sellerSchema = User.discriminator(
  "Seller",
  new mongoose.Schema({
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    storeName: {
      type: String,
      required: true,
      trim: true,
    },
    sellerStatus: {
      type: String,
      enum: ["pending", "active", "inactive"],
      default: "pending",
    },
    storeAddress: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
  })
);

const Seller = mongoose.model("Seller", sellerSchema.scheme);
export default Seller;
