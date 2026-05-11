const express = require('express');
const router = express.Router();
const { dbOps } = require('../db/database');

router.get('/customer/:phone', (req, res) => {
  const customer = dbOps.getCustomerByPhone(req.params.phone);
  if (!customer) return res.json({ customer: null, bookings: [] });
  const bookings = dbOps.getBookingsByCustomer(customer.id);
  res.json({ customer, bookings });
});

router.get('/:ref', (req, res) => {
  const booking = dbOps.getBookingByRef(req.params.ref);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json(booking);
});

router.patch('/:ref/status', (req, res) => {
  const { status, payment_status, payment_id } = req.body;
  const updates = {};
  if (status) updates.status = status;
  if (payment_status) updates.payment_status = payment_status;
  if (payment_id) updates.payment_id = payment_id;
  dbOps.updateBooking(req.params.ref, updates);
  res.json({ success: true });
});

module.exports = router;
