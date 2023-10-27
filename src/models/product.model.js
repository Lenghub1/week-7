import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    min: 3,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    min: 10,
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
});

const Product = mongoose.model("Product", productSchema);
export default Product;
