const { LowSync } = require('lowdb');
const { JSONFileSync } = require('lowdb/node');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'urbanklean.json');

let db;

const defaultData = {
  customers: [],
  services: [],
  offers: [],
  bookings: [],
  conversation_sessions: [],
  time_slots: [],
  _sequences: { customers: 1, services: 1, offers: 1, bookings: 1, sessions: 1, slots: 1 }
};

function getDb() {
  if (!db) {
    const adapter = new JSONFileSync(dbPath);
    db = new LowSync(adapter, defaultData);
    db.read();
    if (!db.data) db.data = defaultData;
    if (!db.data._sequences) db.data._sequences = defaultData._sequences;
    db.write();
  }
  return db;
}

function nextId(table) {
  const db = getDb();
  const id = db.data._sequences[table] || 1;
  db.data._sequences[table] = id + 1;
  return id;
}

// Synchronous SQLite-like helpers
const dbOps = {
  // Customers
  getCustomerByPhone: (phone) => {
    const db = getDb();
    return db.data.customers.find(c => c.phone === phone) || null;
  },
  getCustomerById: (id) => {
    const db = getDb();
    return db.data.customers.find(c => c.id === id) || null;
  },
  createCustomer: ({ phone, name, email }) => {
    const db = getDb();
    const id = nextId('customers');
    const customer = { id, phone, name: name || null, email: email || null, address: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    db.data.customers.push(customer);
    db.write();
    return customer;
  },
  updateCustomer: (id, updates) => {
    const db = getDb();
    const idx = db.data.customers.findIndex(c => c.id === id);
    if (idx >= 0) {
      db.data.customers[idx] = { ...db.data.customers[idx], ...updates, updated_at: new Date().toISOString() };
      db.write();
    }
  },

  // Services
  getAllServices: (category) => {
    const db = getDb();
    const all = db.data.services.filter(s => s.is_active);
    return category && category !== 'all' ? all.filter(s => s.category === category) : all;
  },
  getServiceById: (id) => {
    const db = getDb();
    return db.data.services.find(s => s.id === id && s.is_active) || null;
  },
  getServiceByName: (name) => {
    const db = getDb();
    const lower = name.toLowerCase();
    return db.data.services.find(s => s.is_active && s.name.toLowerCase().includes(lower)) || null;
  },
  insertService: (s) => {
    const db = getDb();
    const id = nextId('services');
    const svc = { id, ...s, is_active: 1 };
    db.data.services.push(svc);
    db.write();
    return svc;
  },

  // Offers
  getActiveOffers: () => {
    const db = getDb();
    const today = new Date().toISOString().slice(0, 10);
    return db.data.offers.filter(o =>
      o.is_active &&
      o.usage_count < o.usage_limit &&
      (!o.valid_till || o.valid_till >= today)
    );
  },
  getOfferByCode: (code) => {
    const db = getDb();
    const today = new Date().toISOString().slice(0, 10);
    return db.data.offers.find(o =>
      o.code.toUpperCase() === code.toUpperCase() &&
      o.is_active &&
      o.usage_count < o.usage_limit &&
      (!o.valid_till || o.valid_till >= today)
    ) || null;
  },
  insertOffer: (o) => {
    const db = getDb();
    const existing = db.data.offers.findIndex(x => x.code === o.code);
    if (existing >= 0) { db.data.offers[existing] = { id: db.data.offers[existing].id, ...o, usage_count: 0, is_active: 1 }; }
    else { db.data.offers.push({ id: nextId('offers'), ...o, usage_count: 0, is_active: 1 }); }
    db.write();
  },

  // Bookings
  createBooking: (data) => {
    const db = getDb();
    const id = nextId('bookings');
    const booking = {
      id,
      ...data,
      status: 'confirmed',
      payment_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.data.bookings.push(booking);
    db.write();
    return booking;
  },
  getBookingByRef: (ref) => {
    const db = getDb();
    return db.data.bookings.find(b => b.booking_ref === ref) || null;
  },
  getBookingsByCustomer: (customerId) => {
    const db = getDb();
    return db.data.bookings
      .filter(b => b.customer_id === customerId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);
  },
  updateBooking: (ref, updates) => {
    const db = getDb();
    const idx = db.data.bookings.findIndex(b => b.booking_ref === ref);
    if (idx >= 0) {
      db.data.bookings[idx] = { ...db.data.bookings[idx], ...updates, updated_at: new Date().toISOString() };
      db.write();
    }
  },

  // Time slots
  getBookedSlots: (date) => {
    const db = getDb();
    return db.data.time_slots.filter(s => s.date === date && s.is_booked).map(s => s.slot);
  },
  markSlotBooked: (date, slot, bookingId) => {
    const db = getDb();
    const existing = db.data.time_slots.findIndex(s => s.date === date && s.slot === slot);
    if (existing >= 0) {
      db.data.time_slots[existing].is_booked = 1;
      db.data.time_slots[existing].booking_id = bookingId;
    } else {
      db.data.time_slots.push({ id: nextId('slots'), date, slot, is_booked: 1, booking_id: bookingId });
    }
    db.write();
  },

  // Conversation sessions
  getSession: (sid) => {
    const db = getDb();
    return db.data.conversation_sessions.find(s => s.session_id === sid) || null;
  },
  createSession: (sid, phone) => {
    const db = getDb();
    const session = { id: nextId('sessions'), session_id: sid, customer_phone: phone || null, messages: [], state: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    db.data.conversation_sessions.push(session);
    db.write();
    return session;
  },
  updateSession: (sid, messages, state) => {
    const db = getDb();
    const idx = db.data.conversation_sessions.findIndex(s => s.session_id === sid);
    if (idx >= 0) {
      if (messages !== undefined) db.data.conversation_sessions[idx].messages = messages;
      if (state !== undefined) db.data.conversation_sessions[idx].state = state;
      db.data.conversation_sessions[idx].updated_at = new Date().toISOString();
      db.write();
    }
  }
};

module.exports = { getDb, dbOps };
