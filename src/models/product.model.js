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
      enum: ["item", "kg"],
      default: "item",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    categories: String,
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductReview",
      },
    ],
    moreDetails: {
      commonName: String,
      placing: String,
      watering: String,
      soilType: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
