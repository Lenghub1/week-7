import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["credit_card", "cash_on_delivery"],
    required: true,
  },
  cardNumber: {
    type: String,
    unique: true,
  },
  expirationDate: {
    type: String,
  },
  cvv: {
    type: String,
    unique: true,
  },
  nameOnCard: {
    type: String,
  },
});

paymentSchema.pre("validate", async function (next) {
  if (this.paymentMethod === "credit_card") {
    if (!this.expirationDate || !this.cvv || !this.nameOnCard) {
      next(
        new Error(
          "For credit card payment method, cardNumber, expirationDate, cvv, and nameOnCard are required."
        )
      );
    } else {
      next();
    }
  } else {
    next();
  }
});

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
