require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { dbOps } = require('./database');

const services = [
  {
    name: 'Regular Home Cleaning',
    description: 'Standard cleaning for your home including dusting, mopping, vacuuming, and bathroom sanitization.',
    category: 'home',
    base_price: 999,
    duration_mins: 120,
    pricing_variants: { '1BHK': 999, '2BHK': 1499, '3BHK': 1999, '4BHK': 2499, 'Villa': 3499 },
    highlights: ['Dusting all surfaces', 'Floor mopping & vacuuming', 'Bathroom sanitization', 'Kitchen wipe-down', 'Trash removal'],
    icon: '🏠'
  },
  {
    name: 'Deep Cleaning',
    description: 'Intensive top-to-bottom cleaning including inside appliances, cabinets, and hard-to-reach areas.',
    category: 'home',
    base_price: 2499,
    duration_mins: 240,
    pricing_variants: { '1BHK': 2499, '2BHK': 2999, '3BHK': 3499, '4BHK': 4499, 'Villa': 5999 },
    highlights: ['Everything in regular cleaning', 'Inside appliances (fridge, microwave, oven)', 'Inside cabinets & drawers', 'Bathroom grout scrubbing', 'Balcony deep clean'],
    icon: '✨'
  },
  {
    name: 'Bathroom Deep Clean',
    description: 'Thorough bathroom cleaning including tile scrubbing, fixture polishing, and disinfection.',
    category: 'specialty',
    base_price: 499,
    duration_mins: 60,
    pricing_variants: { 'Per bathroom': 499, '2 bathrooms': 849, '3 bathrooms': 1149 },
    highlights: ['Tile & grout scrubbing', 'Toilet disinfection', 'Fixture polishing', 'Mirror cleaning', 'Floor deep scrub'],
    icon: '🚿'
  },
  {
    name: 'Kitchen Deep Clean',
    description: 'Complete kitchen cleaning including chimney, hob, countertops, and appliance exteriors.',
    category: 'specialty',
    base_price: 799,
    duration_mins: 90,
    pricing_variants: { 'Standard': 799, 'With chimney': 1199, 'With all appliances': 1499 },
    highlights: ['Chimney & exhaust cleaning', 'Hob & burner scrubbing', 'Countertop disinfection', 'Cabinet exterior wipe', 'Sink & drain cleaning'],
    icon: '🍳'
  },
  {
    name: 'Sofa & Upholstery Cleaning',
    description: 'Professional sofa and upholstery cleaning using steam and dry cleaning techniques.',
    category: 'specialty',
    base_price: 699,
    duration_mins: 90,
    pricing_variants: { '2-seater': 699, '3-seater': 899, 'L-shape': 1299, 'Per chair': 299 },
    highlights: ['Deep foam extraction', 'Stain removal', 'Odour elimination', 'Fabric sanitization', 'Quick-dry treatment'],
    icon: '🛋️'
  },
  {
    name: 'Carpet & Rug Cleaning',
    description: 'Hot water extraction and dry cleaning for carpets and rugs of all sizes.',
    category: 'specialty',
    base_price: 499,
    duration_mins: 60,
    pricing_variants: { 'Small (up to 5x7 ft)': 499, 'Medium (up to 8x10 ft)': 799, 'Large (above 8x10 ft)': 1199 },
    highlights: ['Hot water extraction', 'Stain & odour removal', 'Anti-bacterial treatment', 'Quick dry', 'Free pickup & delivery'],
    icon: '🪵'
  },
  {
    name: 'Move-in / Move-out Cleaning',
    description: 'Complete end-of-tenancy or move-in cleaning to ensure the property is spotless.',
    category: 'home',
    base_price: 3999,
    duration_mins: 300,
    pricing_variants: { '1BHK': 3999, '2BHK': 4999, '3BHK': 5999, '4BHK': 7499, 'Villa': 9999 },
    highlights: ['Full deep cleaning', 'Balcony & terrace', 'Window tracks & blinds', 'Inside all fixtures', 'Post-cleaning inspection'],
    icon: '🔑'
  },
  {
    name: 'Office Cleaning',
    description: 'Professional office and commercial space cleaning for a healthy work environment.',
    category: 'commercial',
    base_price: 2999,
    duration_mins: 180,
    pricing_variants: { 'Up to 500 sqft': 2999, '500-1000 sqft': 4499, '1000-2000 sqft': 6999, 'Above 2000 sqft': 9999 },
    highlights: ['Workstation sanitization', 'Common area cleaning', 'Pantry & washrooms', 'Trash & recycling', 'Flexible scheduling (off-hours available)'],
    icon: '🏢'
  }
];

const offers = [
  { code: 'FIRSTKLEAN', title: 'First Booking Discount', description: 'Get 20% off on your very first booking with Urban Klean!', discount_type: 'percent', discount_value: 20, min_order: 500, max_discount: 500, valid_till: '2025-12-31', usage_limit: 1000 },
  { code: 'SUMMER25',   title: 'Summer Savings',         description: 'Flat ₹500 off on all bookings above ₹2,500 this summer.',          discount_type: 'flat',    discount_value: 500, min_order: 2500, max_discount: 500, valid_till: '2025-06-30', usage_limit: 500 },
  { code: 'DEEPKLEAN15',title: 'Deep Clean Special',     description: '15% off on any Deep Cleaning or Move-in/Move-out service.',        discount_type: 'percent', discount_value: 15, min_order: 2000, max_discount: 750, valid_till: '2025-08-31', usage_limit: 200 },
  { code: 'WEEKEND10',  title: 'Weekend Offer',          description: 'Book any service for the weekend and get 10% off.',                discount_type: 'percent', discount_value: 10, min_order: 0,    max_discount: 300, valid_till: '2025-12-31', usage_limit: 9999 }
];

services.forEach(s => dbOps.insertService(s));
offers.forEach(o => dbOps.insertOffer(o));

console.log(`✅ Seeded ${services.length} services`);
console.log(`✅ Seeded ${offers.length} offers`);
console.log('🎉 Database ready! File: db/urbanklean.json');
