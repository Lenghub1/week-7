import mongoose from "mongoose";

const deviceSchema = mongoose.Schema({
  deviceName: {
    type: String,
    required: true,
  },
  deviceType: {
    type: String,
    required: true,
  },
  loginAt: {
    type: Date,
    required: true,
  },
  deviceLocation: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Device = mongoose.model("Device", deviceSchema);
export default Device;
