import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'cash_on_delivery'],
      required: true
    },
    cardNumber: {
      type: String
    },
    expirationDate: {
      type: Date
    },
    cvv: {
      type: String
    },
    nameOnCard: {
        type: String
    }
  });
  
  const Payment = mongoose.model('Payment', paymentSchema);
  export default Payment;