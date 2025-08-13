// server.js
require('dotenv').config(); 
const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Initialize Razorpay with env keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

// ✅ Send public Key ID to frontend
app.get("/get-razorpay-key", (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// ✅ Create a payment order
app.post("/create-order", async (req, res) => {
  const options = {
    amount: 29900, // ₹299 in paise
    currency: "INR",
    receipt: "order_rcptid_11",
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).send(err);
  }
});

// ✅ Verify payment signature securely
app.post("/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY) // 🔁 Use env variable here
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature === razorpay_signature) {
    res.json({ status: "success" });
  } else {
    res.status(400).json({ status: "failure" });
  }
});

// ✅ Start the server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
