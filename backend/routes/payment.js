const express = require('express');
const router = express.Router();
const { dbOps } = require('../db/database');
const crypto = require('crypto');

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  const Razorpay = require('razorpay');
  razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}

router.post('/create-order', async (req, res) => {
  const { booking_ref, amount } = req.body;
  if (!booking_ref || !amount) return res.status(400).json({ error: 'booking_ref and amount required' });

  const booking = dbOps.getBookingByRef(booking_ref);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  if (!razorpay) {
    const mockOrderId = `order_demo_${Date.now()}`;
    dbOps.updateBooking(booking_ref, { razorpay_order_id: mockOrderId });
    return res.json({ demo_mode: true, order_id: mockOrderId, amount: amount * 100, currency: 'INR', booking_ref });
  }

  const order = await razorpay.orders.create({ amount: amount * 100, currency: 'INR', receipt: booking_ref });
  dbOps.updateBooking(booking_ref, { razorpay_order_id: order.id });
  res.json({ order_id: order.id, amount: order.amount, currency: order.currency, key: process.env.RAZORPAY_KEY_ID, booking_ref });
});

router.post('/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_ref } = req.body;

  if (!razorpay || razorpay_order_id?.startsWith('order_demo_')) {
    dbOps.updateBooking(booking_ref, { payment_status: 'paid', payment_id: `pay_demo_${Date.now()}`, status: 'confirmed' });
    return res.json({ success: true, demo_mode: true, booking_ref });
  }

  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');

  if (expected !== razorpay_signature) return res.status(400).json({ error: 'Payment verification failed' });

  dbOps.updateBooking(booking_ref, { payment_status: 'paid', payment_id: razorpay_payment_id, status: 'confirmed' });
  res.json({ success: true, payment_id: razorpay_payment_id, booking_ref });
});

module.exports = router;
