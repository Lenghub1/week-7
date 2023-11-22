import mongoose from "mongoose";

const sessionSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // deviceName: {
    //   type: String,
    //   required: true,
    // },
    // deviceType: {
    //   type: String,
    //   required: true,
    // },
    // loginAt: {
    //   type: Date,
    //   required: true,
    // },
    refreshToken: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    // deviceLocation: {
    //   type: {
    //     type: String,
    //     enum: ["Point"],
    //     required: true,
    //   },
    //   coordinates: {
    //     type: [Number],
    //     required: true,
    //   },
    // },
  },
  {
    timestamps: true,
  }
);

// Each document will remove from db after 30 days
sessionSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

const Session = mongoose.model("Session", sessionSchema);
export default Session;
