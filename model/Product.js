import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  comparePrice: { type: Number, required: true },
  stock: {
    type: Number,
    default: 0, // ✅ Default stock to 0 if not provided
  },
  images: [String],
  discount: Number,
  category: String,
  description: String,
  sizes: [String],
  colors: [String],
});

const Product = mongoose.model("Product", productSchema);

export default Product;
