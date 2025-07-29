import express from "express";
import multer from "multer";
import Product from "../model/Product.js";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../uploads"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "password123";

const verifyAdmin = (req, res, next) => {
  const { email, password } = req.headers;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Add Product
router.post(
  "/add",
  verifyAdmin,
  upload.array("images", 100),
  async (req, res) => {
    try {
      const {
        name,
        price,
        comparePrice,
        stock,
        category,
        subcategory,
        sizes,
        colors,
        description,
        shippingPrice,
      } = req.body;

      const product = new Product({
        name,
        price: Number(price),
        comparePrice: Number(comparePrice),
        stock: Number(stock) || 0,
        category,
        subcategory,
        description,
        shippingPrice: Number(shippingPrice) || 0,
        sizes: sizes ? sizes.split(",") : [],
        colors: colors ? colors.split(",") : [],
        images: req.files.map((file) => file.filename),
      });

      await product.save();
      res.json({ message: "Product Added", product });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Edit Product
router.put(
  "/edit/:id",
  verifyAdmin,
  upload.array("images", 100),
  async (req, res) => {
    try {
      const {
        name,
        price,
        comparePrice,
        stock,
        category,
        subcategory,
        sizes,
        colors,
        description,
        shippingPrice,
      } = req.body;

      const updateData = {
        name,
        price: Number(price),
        comparePrice: Number(comparePrice),
        stock: Number(stock) || 0,
        category,
        subcategory,
        description,
        shippingPrice: Number(shippingPrice) || 0,
        sizes: sizes ? sizes.split(",") : [],
        colors: colors ? colors.split(",") : [],
      };

      if (req.files.length > 0) {
        updateData.images = req.files.map((file) => file.filename);
      }

      const updated = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      res.json({ message: "Product Updated", product: updated });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Get Products
router.get("/", async (req, res) => {
  const { category, subcategory } = req.query;
  try {
    const filter = {};
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;

    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
