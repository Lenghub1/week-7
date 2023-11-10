import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
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
      integer: true,
      min: 0,
      required: true,
    },
    unit: {
      type: String,
      enum: ["item", "kg", "pot"],
      default: "item",
    },
    availableStock: {
      type: Number,
      min: 0,
      required: true,
    },
    soldAmount: {
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
    reviews: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        review: String,
        rating: Number,
        upVote: Number,
        downVote: Number,
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    reviewCount: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["public", "hidden"],
      default: "public",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({
  status: 1,
});
productSchema.index({
  sellerId: 1,
});
productSchema.index({
  categories: 1,
});

productSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title + "-" + Date.now(), {
      lower: true,
      strict: true,
    });
  }
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
