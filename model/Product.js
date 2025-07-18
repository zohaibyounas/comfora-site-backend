import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  comparePrice: Number,
  images: [String], // ✅ multiple images stored as array
  discount: Number,
  category: String,
  description: String,
  sizes: [String],
  colors: [String],
});

const Product = mongoose.model("Product", productSchema);

export default Product;
