import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: String,
  price: Number,
  shippingPrice: Number,
  selectedSize: String,
  selectedColor: String,
  quantity: { type: Number, default: 1 },
});

const cartSchema = new mongoose.Schema({
  sessionId: { type: String, required: true }, // for guest users
  items: [cartItemSchema],
  createdAt: { type: Date, default: Date.now },
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
