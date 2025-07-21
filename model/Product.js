import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  comparePrice: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  images: [String],
  discount: Number,
  category: String, // e.g. "bras"
  subcategory: String, // e.g. "lace", "cotton"
  description: String,
  sizes: [String],
  colors: [String],
});

const Product = mongoose.model("Product", productSchema);

export default Product;
