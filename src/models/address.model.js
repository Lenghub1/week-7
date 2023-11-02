import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  pinPoint: {
    type: "Point",
    coordinates: [11.5, 104.9],
    required: true,
  },
  addressLine: {
    type: String,
    required: true,
  },
});

const Address = mongoose.model("Address", addressSchema);
export default Address;
