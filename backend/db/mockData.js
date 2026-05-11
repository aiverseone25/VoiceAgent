const nextYear = new Date().getFullYear() + 1;
const validTill = `${nextYear}-12-31`;

const services = [
  {
    name: 'Regular Home Cleaning',
    aliases: ['home cleaning', 'house cleaning', 'flat cleaning', 'apartment cleaning', 'maid cleaning', 'basic cleaning'],
    description: 'Standard home cleaning with dusting, sweeping, mopping, bathroom sanitization, and kitchen wipe-down.',
    category: 'home',
    base_price: 999,
    duration_mins: 120,
    pricing_variants: { '1BHK': 999, '2BHK': 1499, '3BHK': 1999, '4BHK': 2499, Villa: 3499 },
    highlights: ['Dusting all surfaces', 'Floor mopping and vacuuming', 'Bathroom sanitization', 'Kitchen wipe-down', 'Trash removal'],
    icon: 'home'
  },
  {
    name: 'Premium Home Deep Cleaning',
    aliases: ['deep cleaning', 'full home deep clean', 'complete house cleaning', 'festival cleaning', 'spring cleaning'],
    description: 'Top-to-bottom deep cleaning for the whole home, including hard-to-reach areas and detailed scrubbing.',
    category: 'home',
    base_price: 2499,
    duration_mins: 240,
    pricing_variants: { '1BHK': 2499, '2BHK': 2999, '3BHK': 3499, '4BHK': 4499, Villa: 5999 },
    highlights: ['Everything in regular cleaning', 'Bathroom grout scrubbing', 'Kitchen degreasing', 'Balcony cleaning', 'Detailed dust removal'],
    icon: 'sparkles'
  },
  {
    name: 'Bathroom Deep Cleaning',
    aliases: ['bathroom cleaning', 'toilet cleaning', 'washroom cleaning', 'bathroom sanitization', 'home bathroom cleaning'],
    description: 'Bathroom tile, grout, toilet, shower, fixture, mirror, and floor deep cleaning with disinfection.',
    category: 'specialty',
    base_price: 499,
    duration_mins: 60,
    pricing_variants: { '1 bathroom': 499, '2 bathrooms': 849, '3 bathrooms': 1149, '4 bathrooms': 1399 },
    highlights: ['Tile and grout scrubbing', 'Toilet disinfection', 'Fixture polishing', 'Mirror cleaning', 'Floor deep scrub'],
    icon: 'bath'
  },
  {
    name: 'Kitchen Deep Cleaning',
    aliases: ['kitchen cleaning', 'kitchen degreasing', 'chimney cleaning', 'hob cleaning', 'stove cleaning'],
    description: 'Kitchen cleaning for countertops, stove, hob, sink, cabinet exteriors, tiles, and optional chimney cleaning.',
    category: 'specialty',
    base_price: 799,
    duration_mins: 90,
    pricing_variants: { Standard: 799, 'With chimney': 1199, 'With appliances': 1499, 'Full kitchen': 1799 },
    highlights: ['Grease removal', 'Hob and burner scrubbing', 'Sink and drain cleaning', 'Cabinet exterior wipe', 'Wall tile cleaning'],
    icon: 'kitchen'
  },
  {
    name: 'Bedroom Cleaning',
    aliases: ['bedroom cleaning', 'room cleaning', 'kids room cleaning', 'guest room cleaning'],
    description: 'Bedroom dusting, floor cleaning, wardrobe exterior wipe, mirror cleaning, and linen-area sanitization.',
    category: 'home',
    base_price: 399,
    duration_mins: 45,
    pricing_variants: { 'Per room': 399, '2 rooms': 699, '3 rooms': 999, '4 rooms': 1299 },
    highlights: ['Bedside and surface dusting', 'Floor vacuuming and mopping', 'Mirror cleaning', 'Wardrobe exterior wipe'],
    icon: 'bed'
  },
  {
    name: 'Living Room Cleaning',
    aliases: ['living room cleaning', 'hall cleaning', 'drawing room cleaning', 'lounge cleaning'],
    description: 'Living room cleaning including sofa area dusting, TV unit wipe-down, floors, fans, and accessible surfaces.',
    category: 'home',
    base_price: 499,
    duration_mins: 60,
    pricing_variants: { Standard: 499, Large: 799, 'With balcony': 999 },
    highlights: ['TV unit wipe-down', 'Floor cleaning', 'Fan dusting', 'Decor surface dusting'],
    icon: 'sofa'
  },
  {
    name: 'Balcony and Terrace Cleaning',
    aliases: ['balcony cleaning', 'terrace cleaning', 'patio cleaning', 'outdoor cleaning'],
    description: 'Balcony or terrace sweeping, scrubbing, railing wipe-down, drain clearing, and floor washing.',
    category: 'specialty',
    base_price: 599,
    duration_mins: 60,
    pricing_variants: { Balcony: 599, 'Large balcony': 899, Terrace: 1499 },
    highlights: ['Floor scrubbing', 'Railing wipe-down', 'Drain clearing', 'Cobweb removal'],
    icon: 'balcony'
  },
  {
    name: 'Move-in Move-out Cleaning',
    aliases: ['move in cleaning', 'move out cleaning', 'tenant cleaning', 'vacant flat cleaning', 'rental cleaning'],
    description: 'Detailed vacant property cleaning before moving in or after moving out.',
    category: 'home',
    base_price: 3999,
    duration_mins: 300,
    pricing_variants: { '1BHK': 3999, '2BHK': 4999, '3BHK': 5999, '4BHK': 7499, Villa: 9999 },
    highlights: ['Full deep cleaning', 'Window tracks', 'Balcony cleaning', 'Kitchen and bathroom detailing', 'Post-cleaning inspection'],
    icon: 'key'
  },
  {
    name: 'Post Renovation Cleaning',
    aliases: ['post construction cleaning', 'renovation cleaning', 'paint dust cleaning', 'construction dust cleaning'],
    description: 'Heavy dust removal and detailed cleaning after painting, interiors, renovation, or construction work.',
    category: 'home',
    base_price: 4999,
    duration_mins: 360,
    pricing_variants: { '1BHK': 4999, '2BHK': 6499, '3BHK': 7999, Villa: 12999 },
    highlights: ['Fine dust removal', 'Paint mark spot cleaning', 'Floor scrubbing', 'Window and track cleaning'],
    icon: 'tools'
  },
  {
    name: 'Sofa and Upholstery Cleaning',
    aliases: ['sofa cleaning', 'couch cleaning', 'upholstery cleaning', 'chair cleaning', 'fabric sofa cleaning'],
    description: 'Foam extraction and fabric sanitization for sofas, dining chairs, recliners, and upholstered furniture.',
    category: 'specialty',
    base_price: 699,
    duration_mins: 90,
    pricing_variants: { '2-seater': 699, '3-seater': 899, '5-seater': 1299, Recliner: 499, Chair: 299 },
    highlights: ['Deep foam extraction', 'Stain removal', 'Odour treatment', 'Fabric sanitization', 'Quick-dry treatment'],
    icon: 'sofa'
  },
  {
    name: 'Carpet and Rug Cleaning',
    aliases: ['carpet cleaning', 'rug cleaning', 'mat cleaning', 'floor carpet cleaning'],
    description: 'Carpet and rug shampooing, stain treatment, odour removal, and hot-water extraction.',
    category: 'specialty',
    base_price: 499,
    duration_mins: 60,
    pricing_variants: { Small: 499, Medium: 799, Large: 1199, 'Per sq ft': 18 },
    highlights: ['Shampooing', 'Stain treatment', 'Odour removal', 'Hot-water extraction'],
    icon: 'carpet'
  },
  {
    name: 'Mattress Cleaning',
    aliases: ['mattress cleaning', 'bed cleaning', 'mattress sanitization', 'dust mite cleaning'],
    description: 'Mattress vacuuming, shampooing, dust mite treatment, and sanitization.',
    category: 'specialty',
    base_price: 799,
    duration_mins: 60,
    pricing_variants: { Single: 799, Queen: 999, King: 1199 },
    highlights: ['Deep vacuuming', 'Dust mite treatment', 'Stain treatment', 'Sanitization'],
    icon: 'mattress'
  },
  {
    name: 'Curtain and Blind Cleaning',
    aliases: ['curtain cleaning', 'blind cleaning', 'drape cleaning', 'window blind cleaning'],
    description: 'On-site vacuuming and steam cleaning for curtains and blinds.',
    category: 'specialty',
    base_price: 399,
    duration_mins: 60,
    pricing_variants: { 'Per panel': 399, 'Set of 4': 1299, Blinds: 599 },
    highlights: ['Dust removal', 'Steam sanitization', 'Odour treatment', 'Gentle fabric care'],
    icon: 'curtain'
  },
  {
    name: 'Window and Glass Cleaning',
    aliases: ['window cleaning', 'glass cleaning', 'window track cleaning', 'balcony glass cleaning'],
    description: 'Interior window, glass partition, mirror, and track cleaning.',
    category: 'specialty',
    base_price: 599,
    duration_mins: 60,
    pricing_variants: { 'Small home': 599, 'Medium home': 999, 'Large home': 1499, 'Per glass panel': 99 },
    highlights: ['Glass polishing', 'Track cleaning', 'Frame wipe-down', 'Streak-free finish'],
    icon: 'window'
  },
  {
    name: 'Appliance Exterior Cleaning',
    aliases: ['appliance cleaning', 'fridge cleaning', 'microwave cleaning', 'oven cleaning', 'washing machine cleaning'],
    description: 'Exterior and accessible interior cleaning for household appliances.',
    category: 'specialty',
    base_price: 399,
    duration_mins: 45,
    pricing_variants: { Refrigerator: 599, Microwave: 399, Oven: 599, 'Washing machine': 499, Combo: 1299 },
    highlights: ['Degreasing', 'Exterior wipe-down', 'Odour treatment', 'Accessible interior cleaning'],
    icon: 'appliance'
  },
  {
    name: 'Chimney and Exhaust Cleaning',
    aliases: ['chimney cleaning', 'exhaust cleaning', 'kitchen chimney service', 'filter cleaning'],
    description: 'Kitchen chimney filter, hood, and exhaust grease cleaning.',
    category: 'specialty',
    base_price: 899,
    duration_mins: 75,
    pricing_variants: { Basic: 899, Deep: 1299, 'Chimney plus hob': 1699 },
    highlights: ['Filter degreasing', 'Hood cleaning', 'Oil residue removal', 'Odour reduction'],
    icon: 'chimney'
  },
  {
    name: 'Water Tank Cleaning',
    aliases: ['water tank cleaning', 'tank cleaning', 'overhead tank cleaning', 'sump cleaning'],
    description: 'Overhead tank and sump cleaning with sludge removal and disinfection.',
    category: 'specialty',
    base_price: 999,
    duration_mins: 90,
    pricing_variants: { 'Up to 1000L': 999, '1000-2000L': 1499, Sump: 1999 },
    highlights: ['Sludge removal', 'Pressure wash', 'Disinfection', 'Safe draining'],
    icon: 'tank'
  },
  {
    name: 'Floor Scrubbing and Polishing',
    aliases: ['floor cleaning', 'floor scrubbing', 'floor polishing', 'tile polishing', 'marble polishing'],
    description: 'Machine scrubbing and polishing for tiles, marble, granite, and stone floors.',
    category: 'specialty',
    base_price: 1999,
    duration_mins: 180,
    pricing_variants: { 'Up to 500 sqft': 1999, '500-1000 sqft': 3499, 'Per sq ft': 8 },
    highlights: ['Machine scrubbing', 'Stain treatment', 'Polishing', 'Gloss finish'],
    icon: 'floor'
  },
  {
    name: 'Disinfection and Sanitization',
    aliases: ['sanitization', 'disinfection', 'virus disinfection', 'home sanitization', 'office sanitization'],
    description: 'High-touch surface disinfection and mist sanitization for homes and offices.',
    category: 'specialty',
    base_price: 1499,
    duration_mins: 90,
    pricing_variants: { '1BHK': 1499, '2BHK': 1999, '3BHK': 2499, Office: 2999 },
    highlights: ['High-touch disinfection', 'Mist sanitization', 'Child-safe chemicals', 'Odour-free treatment'],
    icon: 'shield'
  },
  {
    name: 'Office Cleaning',
    aliases: ['office cleaning', 'workplace cleaning', 'corporate cleaning', 'commercial cleaning'],
    description: 'Office cleaning for workstations, pantry, floors, meeting rooms, and washrooms.',
    category: 'commercial',
    base_price: 2999,
    duration_mins: 180,
    pricing_variants: { 'Up to 500 sqft': 2999, '500-1000 sqft': 4499, '1000-2000 sqft': 6999, 'Above 2000 sqft': 9999 },
    highlights: ['Workstation sanitization', 'Common area cleaning', 'Pantry cleaning', 'Washroom cleaning', 'Flexible scheduling'],
    icon: 'office'
  },
  {
    name: 'Clinic and Healthcare Cleaning',
    aliases: ['clinic cleaning', 'healthcare cleaning', 'doctor clinic cleaning', 'medical office cleaning', 'booker clinic'],
    description: 'Cleaning and disinfection for clinics, dental offices, diagnostic centers, and healthcare reception areas.',
    category: 'commercial',
    base_price: 3499,
    duration_mins: 180,
    pricing_variants: { 'Small clinic': 3499, 'Medium clinic': 5499, 'Large clinic': 7999 },
    highlights: ['Reception cleaning', 'Treatment room sanitization', 'Washroom disinfection', 'High-touch surface cleaning'],
    icon: 'clinic'
  },
  {
    name: 'Restaurant and Cafe Cleaning',
    aliases: ['restaurant cleaning', 'cafe cleaning', 'hotel kitchen cleaning', 'commercial kitchen cleaning'],
    description: 'Dining area, kitchen, washroom, exhaust-zone, and floor cleaning for restaurants and cafes.',
    category: 'commercial',
    base_price: 3999,
    duration_mins: 240,
    pricing_variants: { Cafe: 3999, Restaurant: 6999, 'Commercial kitchen': 8999 },
    highlights: ['Dining area cleaning', 'Kitchen degreasing', 'Washroom cleaning', 'Floor scrubbing'],
    icon: 'restaurant'
  },
  {
    name: 'Retail Store Cleaning',
    aliases: ['shop cleaning', 'store cleaning', 'showroom cleaning', 'retail cleaning'],
    description: 'Cleaning for shops, salons, boutiques, showrooms, and retail display spaces.',
    category: 'commercial',
    base_price: 2499,
    duration_mins: 150,
    pricing_variants: { 'Small store': 2499, Showroom: 4499, 'Large retail': 6999 },
    highlights: ['Display dusting', 'Glass cleaning', 'Floor cleaning', 'Trial room cleaning'],
    icon: 'store'
  },
  {
    name: 'Society Common Area Cleaning',
    aliases: ['apartment common area cleaning', 'society cleaning', 'staircase cleaning', 'corridor cleaning'],
    description: 'Staircase, corridor, lobby, lift lobby, and common washroom cleaning for apartments and societies.',
    category: 'commercial',
    base_price: 4999,
    duration_mins: 300,
    pricing_variants: { 'Small building': 4999, 'Medium building': 8999, 'Large society': 14999 },
    highlights: ['Lobby cleaning', 'Staircase mopping', 'Lift lobby cleaning', 'Common area sanitization'],
    icon: 'building'
  },
  {
    name: 'Event Cleanup',
    aliases: ['event cleaning', 'party cleanup', 'post event cleaning', 'pre event cleaning'],
    description: 'Pre-event setup cleaning and post-event trash, floor, washroom, and surface cleanup.',
    category: 'commercial',
    base_price: 2999,
    duration_mins: 180,
    pricing_variants: { 'Small event': 2999, 'Medium event': 5999, 'Large event': 9999 },
    highlights: ['Pre-event dusting', 'Post-event trash removal', 'Floor cleaning', 'Washroom refresh'],
    icon: 'event'
  },
  {
    name: 'AC Vent and Duct Cleaning',
    aliases: ['ac vent cleaning', 'duct cleaning', 'air vent cleaning', 'hvac cleaning'],
    description: 'Accessible AC vent and duct dust removal for homes and offices.',
    category: 'specialty',
    base_price: 1499,
    duration_mins: 90,
    pricing_variants: { 'Up to 3 vents': 1499, 'Up to 6 vents': 2499, 'Office vents': 3999 },
    highlights: ['Vent dust removal', 'Grill cleaning', 'Odour reduction', 'Airflow improvement'],
    icon: 'vent'
  },
  {
    name: 'Add-on Fan and Light Fixture Cleaning',
    aliases: ['fan cleaning', 'ceiling fan cleaning', 'light cleaning', 'fixture cleaning'],
    description: 'Add-on cleaning for ceiling fans, light fixtures, and accessible fittings.',
    category: 'specialty',
    base_price: 199,
    duration_mins: 30,
    pricing_variants: { 'Per fan': 199, 'Per light fixture': 149, Combo: 499 },
    highlights: ['Dust removal', 'Fixture wipe-down', 'Ladder-assisted cleaning', 'Add-on friendly'],
    icon: 'fan'
  }
];

const offers = [
  { code: 'FIRSTKLEAN', title: 'First Booking Discount', description: 'Get 20% off on your first Urban Klean booking.', discount_type: 'percent', discount_value: 20, min_order: 500, max_discount: 500, valid_till: validTill, usage_limit: 1000 },
  { code: 'DEEPKLEAN15', title: 'Deep Clean Special', description: '15% off on deep cleaning, move-in, or post-renovation services.', discount_type: 'percent', discount_value: 15, min_order: 2000, max_discount: 750, valid_till: validTill, usage_limit: 500 },
  { code: 'BATHROOM99', title: 'Bathroom Add-on Deal', description: 'Flat 99 rupees off on bathroom deep cleaning above 499 rupees.', discount_type: 'flat', discount_value: 99, min_order: 499, max_discount: 99, valid_till: validTill, usage_limit: 500 },
  { code: 'WEEKEND10', title: 'Weekend Offer', description: 'Book any weekend service and get 10% off.', discount_type: 'percent', discount_value: 10, min_order: 0, max_discount: 300, valid_till: validTill, usage_limit: 9999 }
];

module.exports = { services, offers };
