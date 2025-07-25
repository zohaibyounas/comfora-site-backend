import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  comparePrice: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  images: [String],
  discount: Number,
  category: String,
  subcategory: String,
  description: String,
  sizes: [String],
  colors: [String],
  shippingPrice: { type: Number, default: 0 }, // ✅ New Field
});

const Product = mongoose.model("Product", productSchema);

export default Product;
