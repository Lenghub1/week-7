import mongoose from "mongoose";
import slugify from "slugify";
import utils from "../utils/utils.js";

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
    basePrice: {
      type: Number,
      min: 0,
      required: true,
    },
    unitPrice: {
      type: Number,
      min: 0,
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
    stockAlert: {
      type: Number,
      default: 3,
    },
    imgCover: {
      type: String,
      required: true,
    },
    media: {
      type: [String],
      required: true,
    },
    categories: [
      {
        type: String,
        required: true,
      },
    ],
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
      enum: ["public", "hidden", "deleted"],
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
  // Slugify
  if (this.isModified("title")) {
    this.slug = slugify(this.title + "-" + Date.now(), {
      lower: true,
      strict: true,
    });
  }

  // Set unitPrice (add +10%)
  this.unitPrice = utils.calculateUnitPrice(this.basePrice);
  next();
});

productSchema.pre("findOneAndUpdate", function (next) {
  if (this._update.basePrice)
    this._update.unitPrice = utils.calculateUnitPrice(this._update.basePrice);
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
