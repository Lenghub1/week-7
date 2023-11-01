import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      minLength: 3,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      minLength: 10,
      trim: true,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      enum: ["item", "kg", "pot"],
      default: "item",
    },
    availableStock: {
      type: Number,
      required: true,
    },
    soldItem: {
      type: Number,
      default: 0,
    },
    media: {
      type: [String],
      required: true,
    },
    categories: [String],
    dimension: {
      type: Object,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
