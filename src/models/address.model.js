import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    receiverName: {
      type: String,
      required: true,
      trim: true,
      match: /^[a-zA-Z ]+$/,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryAddress: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
      city: String,
      coordinates: [Number],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Address = mongoose.model("Address", addressSchema);
export default Address;
