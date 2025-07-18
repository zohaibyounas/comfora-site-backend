import express from "express";

const router = express.Router();

// Example dummy admin login route
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Simple authentication logic for demonstration
  if (email === "admin@example.com" && password === "password123") {
    res.json({ success: true, token: "fake-jwt-token" });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

export default router;
