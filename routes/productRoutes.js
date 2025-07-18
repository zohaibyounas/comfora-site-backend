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
const ADMIN_PASSWORD = "admin123";

const verifyAdmin = (req, res, next) => {
  const { email, password } = req.headers;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// ✅ Add Product (with multiple images)
router.post(
  "/add",
  verifyAdmin,
  upload.array("images", 5), // allow up to 5 images
  async (req, res) => {
    try {
      const {
        name,
        price,
        comparePrice,
        category,
        sizes,
        colors,
        description,
      } = req.body;

      const product = new Product({
        name,
        price,
        comparePrice,
        category,
        description,
        sizes: sizes.split(","),
        colors: colors.split(","),
        images: req.files.map((file) => file.filename), // ✅ Save multiple images
      });

      await product.save();
      res.json({ message: "Product Added", product });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ✅ Get All Products
router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

export default router;
