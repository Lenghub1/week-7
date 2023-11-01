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
  },
  expirationDate: {
    type: Date,
  },
  cvv: {
    type: String,
  },
  nameOnCard: {
    type: String,
  },
});

paymentSchema.pre("validate", async function (next) {
  if (this.paymentMethod === "credit_card") {
    let cardExists = await checkCardNumber(this.cardNumber);
    if (!cardExists || !this.expirationDate || !this.cvv || !this.nameOnCard) {
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
