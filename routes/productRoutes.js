import express from "express";
import multer from "multer";
import Product from "../model/Product.js";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Cloudinary configuration
cloudinary.config({
  cloud_name: "dion8xgh4",
  api_key: "135699971577598",
  api_secret: "B4aq8GXLFAh25hjI6Zd58OAL6UM",
});

// Multer storage using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    // transformation: [{ width: 800, height: 800, crop: "limit" }],
  },
});

const upload = multer({ storage });

const router = express.Router();

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
        images: req.files.map((file) => file.path), // <-- Use Cloudinary URLs
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
        updateData.images = req.files.map((file) => file.path); // <-- Use Cloudinary URLs
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

// Delete Product
router.delete("/delete/:id", verifyAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete images from Cloudinary
    const imagePublicIds = product.images.map((url) => {
      const parts = url.split("/");
      const fileName = parts[parts.length - 1];
      const publicId = "products/" + fileName.split(".")[0]; // assumes folder is 'products'
      return publicId;
    });

    for (const publicId of imagePublicIds) {
      await cloudinary.uploader.destroy(publicId);
    }

    // Remove product from DB
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
