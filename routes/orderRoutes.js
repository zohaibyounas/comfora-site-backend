import express from "express";
import multer from "multer";
import nodemailer from "nodemailer";
import path from "path";
import Order from "../model/Order.js"; // ✅ Import your Order model
import { fileURLToPath } from "url";

const router = express.Router();

// __dirname replacement for ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// POST /checkout
router.post("/checkout", upload.single("paymentImage"), async (req, res) => {
  try {
    const { name, email, address, paymentMethod } = req.body;
    const paymentImage =
      paymentMethod === "bank" && req.file ? req.file.filename : null;

    const order = await Order.create({
      name,
      email,
      address,
      paymentMethod,
      paymentImage,
    });

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "zohaiby737@gmail.com",
        pass: "djcm wnmc knjc lfld",
      },
    });

    const mailOptions = {
      from: "zohaiby737@gmail.com",
      to: `${email}, zohaiby737@gmail.com`,
      subject: "Order Confirmation",
      html: `<p>Hi ${name},</p>
             <p>Your order has been placed successfully.</p>
             <p><strong>Payment Method:</strong> ${paymentMethod}</p>
             ${
               paymentImage
                 ? `<p><strong>Payment Proof:</strong> ${paymentImage}</p>`
                 : ""
             }`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Order placed", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// PUT /order/:id/status
router.put("/order/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    // Get the order by ID first
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Update the order status
    order.status = status;
    await order.save();

    // Send email to the customer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "zohaiby737@gmail.com",
        pass: "djcm wnmc knjc lfld",
      },
    });

    const mailOptions = {
      from: "zohaiby737@gmail.com",
      to: `${order.email}, zohaiby737@gmail.com`,
      subject: "Order Status Update",
      html: `<p>Hi ${order.name},</p>
             <p>Your order status has been updated to <strong>${status}</strong>.</p>
             <p>Thank you for shopping with us!</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update status and send email" });
  }
});

// GET /orders - fetch all
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// DELETE /order/:id
router.delete("/order/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted", order });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Failed to delete order" });
  }
});

export default router;
