require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { dbOps } = require('./database');
const { services, offers } = require('./mockData');

services.forEach(s => dbOps.insertService(s));
offers.forEach(o => dbOps.insertOffer(o));

console.log(`✅ Seeded ${services.length} services`);
console.log(`✅ Seeded ${offers.length} offers`);
console.log('🎉 Database ready! File: db/urbanklean.json');
