import express from "express";
import Cart from "../model/Cart.js";
import Product from "../model/Product.js";

const router = express.Router();

// POST /cart/add
router.post("/add", async (req, res) => {
  try {
    const {
      sessionId,
      productId,
      selectedSize,
      selectedColor,
      quantity = 1,
    } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ sessionId });

    const newItem = {
      productId,
      name: product.name,
      price: product.price,
      shippingPrice: product.shippingPrice,
      selectedSize,
      selectedColor,
      quantity,
    };

    if (cart) {
      // Check if item already exists
      const existingItem = cart.items.find(
        (item) =>
          item.productId.toString() === productId &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push(newItem);
      }
    } else {
      cart = new Cart({ sessionId, items: [newItem] });
    }

    await cart.save();
    res.json({ message: "Item added to cart", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /cart/:sessionId
router.get("/:sessionId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ sessionId: req.params.sessionId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /cart/:sessionId/:productId
router.delete("/:sessionId/:productId", async (req, res) => {
  try {
    const { sessionId, productId } = req.params;

    const cart = await Cart.findOneAndUpdate(
      { sessionId },
      { $pull: { items: { productId } } },
      { new: true }
    );

    res.json({ message: "Item removed", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
