import mongoose from "mongoose";
import validator from "validator";
import slugify from "slugify";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      match: /^[a-zA-Z ]+$/, // Include atleast one string
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      match: /^[a-zA-Z ]+$/,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      validate: validator.isEmail,
    },
    profilePicture: String,
    slug: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator(val) {
          return validator.isStrongPassword(val, {
            minSymbols: 0,
            minUppercase: 0,
            minLength: 8,
            minNumbers: 0,
            minLowercase: 1,
          });
        },
        validator(val) {
          return val.trim() == val;
        },
      },
    },
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
    forgotPasswordToken: String,
    forgotPasswordExpires: Date,
    passwordChangeAt: Date,
    active: {
      type: Boolean,
      default: true,
    },
    refreshToken: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre("save", function (next) {
  if (this.isModified("firstName") || this.isModified("lastName")) {
    const fullName = `${this.firstName} ${this.lastName}`;
    this.slug = slugify(fullName + "-" + Date.now(), {
      lower: true,
      strict: true,
    });
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
