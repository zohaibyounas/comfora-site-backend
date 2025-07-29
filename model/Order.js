import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  address: String,
  apartment: String,
  city: String,
  zipCode: String,
  phone: String,
  paymentMethod: { type: String, enum: ["bank", "cod"] },
  paymentImage: String,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
