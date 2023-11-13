import mongoose from "mongoose";

const conversionRateSchema = new mongoose.Schema({
  totalVisitors: Number,
  totalPurchases: Number,
  conversionRate: Number,
});

const averageOrderValueRateSchema = new mongoose.Schema({
  totalOrders: Number,
  totalOrdersValue: Number,
  averageOrderValue: Number,
});

const cartAbandonmentRateSchema = new mongoose.Schema({
  totalCarts: Number,
  totalPurchases: Number,
  cartAbandonmentRate: Number,
});

const metricSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  conversionRate: conversionRateSchema,
  averageOrderValueRate: averageOrderValueRateSchema,
  cartAbandonmentRate: cartAbandonmentRateSchema,
});

const Metric = mongoose.model("Metric", metricSchema);
export default Metric;
