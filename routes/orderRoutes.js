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
    const {
      firstName,
      lastName,
      email,
      address,
      apartment,
      city,
      zipCode,
      phone,
      paymentMethod,
    } = req.body;

    const paymentImage =
      paymentMethod === "bank" && req.file ? req.file.filename : null;

    const order = await Order.create({
      firstName,
      lastName,
      email,
      address,
      apartment,
      city,
      zipCode,
      phone,
      paymentMethod,
      paymentImage,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "comforapk@gmail.com",
        pass: "ycsx rphp igsu hess", // ✅ Suggest to move to .env for security
      },
    });

    // ✅ Email to customer
    const mailOptionsCustomer = {
      from: "comforapk@gmail.com",
      to: `${email}`,
      subject: "Order Confirmation",
      html: `
        <p>Hi ${firstName} ${lastName},</p>
        <p>Your order has been placed successfully.</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        <p><strong>Shipping Address:</strong> ${address}, ${apartment}, ${city}, ${zipCode}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        ${
          paymentImage
            ? `<p><strong>Payment Proof Attached Below.</strong></p>`
            : ""
        }
      `,
      attachments: paymentImage
        ? [
            {
              filename: paymentImage,
              path: path.join(__dirname, "../uploads", paymentImage),
            },
          ]
        : [],
    };

    // ✅ Email to admin
    const mailOptionsAdmin = {
      from: "comforapk@gmail.com",
      to: "comforapk@gmail.com",
      subject: "Comfora - New Order Received",
      html: `
        <p>You have received a new order from ${firstName} ${lastName}.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Address:</strong> ${address}, ${apartment}, ${city}, ${zipCode}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        ${
          paymentImage
            ? `<p><strong>Payment Proof Attached Below.</strong></p>`
            : ""
        }
      `,
      attachments: paymentImage
        ? [
            {
              filename: paymentImage,
              path: path.join(__dirname, "../uploads", paymentImage),
            },
          ]
        : [],
    };

    await transporter.sendMail(mailOptionsCustomer);
    await transporter.sendMail(mailOptionsAdmin);

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
        user: "comforapk@gmail.com",
        pass: "ycsx rphp igsu hess",
      },
    });

    const mailOptions = {
      from: "comforapk@gmail.com",
      to: `${order.email}`,
      subject: "Order Status Update",
      html: `
        <p>Hi ${order.firstName} ${order.lastName},</p>
        <p>Your order status has been updated to <strong>${status}</strong>.</p>
        <p>Thank you for shopping with us!</p>
      `,
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
