const express = require('express');
const router = express.Router();
const { dbOps } = require('../db/database');

router.get('/', (req, res) => {
  res.json(dbOps.getActiveOffers());
});

router.post('/validate', (req, res) => {
  const { code, amount } = req.body;
  if (!code || !amount) return res.status(400).json({ error: 'code and amount are required' });

  const offer = dbOps.getOfferByCode(code);
  if (!offer) return res.json({ valid: false, message: 'Invalid or expired offer code' });
  if (amount < offer.min_order) return res.json({ valid: false, message: `Minimum order of ₹${offer.min_order} required` });

  let discount = offer.discount_type === 'percent'
    ? Math.round(amount * offer.discount_value / 100)
    : offer.discount_value;
  if (offer.max_discount) discount = Math.min(discount, offer.max_discount);

  res.json({ valid: true, offer_code: offer.code, title: offer.title, description: offer.description, discount_amount: discount, final_amount: amount - discount });
});

module.exports = router;
