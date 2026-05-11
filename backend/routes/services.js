const express = require('express');
const router = express.Router();
const { dbOps } = require('../db/database');

router.get('/', (req, res) => {
  const services = dbOps.getAllServices(req.query.category);
  res.json(services);
});

router.get('/:id', (req, res) => {
  const service = dbOps.getServiceById(Number(req.params.id));
  if (!service) return res.status(404).json({ error: 'Service not found' });
  res.json(service);
});

module.exports = router;
