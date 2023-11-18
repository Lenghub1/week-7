import mongoose from "mongoose";
import validator from "validator";
import slugify from "slugify";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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
            minNumbers: 1,
            minLowercase: 1,
          });
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto delete document if user not activate their account for 10 minutes.
userSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 10 * 60, partialFilterExpression: { active: false } }
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

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Methods
userSchema.methods.verifyPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.forgotPasswordExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);
export default User;
