# 🤖 Urban Klean — Dino Voice Agent

> **Say "Hey Dino"** to instantly book professional cleaning services, check offers, and view your booking history — all through natural voice conversation.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎙 Wake Word | "Hey Dino" activates the assistant automatically |
| 🧠 Claude AI | Natural conversation powered by Claude Sonnet |
| 📅 Full Booking | Service → Slot → Address → Payment → Confirmation |
| 💳 Razorpay | India-native payment gateway integration |
| 🎁 Offers | Live promo codes with auto-apply |
| 📋 History | Customer booking history by phone |
| 🔊 TTS | Dino speaks back using Web Speech API |
| ⌨️ Hybrid | Voice + text input supported simultaneously |
| 📱 Mobile-first | Designed as a mobile app assistant |

---

## 🏗 Architecture

```
VoiceAgent/
├── backend/               # Node.js + Express API
│   ├── server.js          # Entry point, rate limiting, CORS
│   ├── db/
│   │   ├── database.js    # SQLite schema & connection
│   │   └── seed.js        # 8 services + 4 offers seed data
│   ├── services/
│   │   └── claudeAgent.js # Claude API + 8 booking tools
│   └── routes/
│       ├── conversation.js # POST /api/conversation/chat
│       ├── services.js     # GET /api/services
│       ├── bookings.js     # Booking CRUD
│       ├── offers.js       # Offer validation
│       └── payment.js      # Razorpay integration
└── frontend/              # React + Vite + Tailwind
    └── src/
        ├── App.jsx         # Main app, voice orchestration
        ├── context/
        │   └── DinoContext.jsx      # Global state (useReducer)
        ├── hooks/
        │   └── useSpeechRecognition.js  # Web Speech API wrapper
        └── components/
            ├── IdleScreen.jsx       # Wake word waiting screen
            ├── DinoAvatar.jsx       # Animated Dino avatar
            ├── VoiceBars.jsx        # Audio visualizer
            ├── ConversationDisplay.jsx  # Chat bubbles
            ├── OffersCarousel.jsx   # Horizontal offers strip
            ├── BookingConfirmation.jsx  # Payment modal
            ├── BookingHistory.jsx   # Past bookings
            └── ServicesGrid.jsx     # Service catalogue
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Chrome or Edge (for Web Speech API)
- Anthropic API key

### 1. Backend Setup

```bash
cd backend
npm install

# Copy and configure env
cp .env.example .env
# Edit .env — add your ANTHROPIC_API_KEY

# Seed the database with services & offers
npm run seed

# Start the server
npm run dev
# → http://localhost:3001
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 3. Say "Hey Dino"!

Open `http://localhost:5173` in **Chrome** or **Edge**, allow microphone access, and say **"Hey Dino"**.

---

## 🎯 Demo Script (Pitch Ready)

Use this script to demonstrate all key flows:

### Flow 1 — New Booking
```
User:  "Hey Dino"
Dino:  "Hi! I'm Dino, your Urban Klean assistant. How can I help?"

User:  "I want to book a deep cleaning for my 3BHK"
Dino:  "Great choice! Our 3BHK Deep Cleaning is ₹3,499. When would you like it done?"

User:  "This Saturday"
Dino:  "We have slots on Saturday. Morning 9 AM to 12 PM, or afternoon 2 PM to 5 PM?"

User:  "Morning works"
Dino:  "Perfect! What's your address?"

User:  "Flat 204, Green Valley Apartments, Banjara Hills, Hyderabad"
Dino:  "Got it! Also, I have a Summer Savings offer — ₹500 off on orders above ₹2,500. Apply it?"

User:  "Yes please"
Dino:  "Applied! Your total is ₹2,999. Shall I confirm the booking?"

User:  "Yes confirm"
Dino:  "Booking confirmed! Your reference is UKL-ABC123. Payment of ₹2,999 is pending..."
[Booking confirmation card appears → user taps Pay → Demo payment confirms]
```

### Flow 2 — Check Offers
```
User:  "Hey Dino, what offers do you have?"
Dino:  "We have 4 offers! FIRSTKLEAN gives 20% off your first booking..."
[Offers carousel is visible in the UI]
```

### Flow 3 — Booking History
```
User:  "Hey Dino, show me my past bookings"
Dino:  "Sure! What's your phone number?"
User:  "9876543210"
Dino:  "Found 2 bookings for you..."
[History modal opens automatically]
```

---

## 🔧 Configuration

### Environment Variables (backend/.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | ✅ | Claude API key from console.anthropic.com |
| `RAZORPAY_KEY_ID` | Optional | Razorpay test key (demo mode if missing) |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay secret |
| `FRONTEND_URL` | Optional | CORS origin (default: localhost:5173) |
| `PORT` | Optional | Server port (default: 3001) |

---

## 📦 Services Catalogue

| Service | Starting Price | Duration |
|---------|---------------|----------|
| Regular Home Cleaning | ₹999 (1BHK) | 2 hrs |
| Deep Cleaning | ₹2,499 (1BHK) | 4 hrs |
| Bathroom Deep Clean | ₹499/bathroom | 1 hr |
| Kitchen Deep Clean | ₹799 | 1.5 hrs |
| Sofa & Upholstery | ₹699 (2-seater) | 1.5 hrs |
| Carpet & Rug Cleaning | ₹499 (small) | 1 hr |
| Move-in / Move-out | ₹3,999 (1BHK) | 5 hrs |
| Office Cleaning | ₹2,999 | 3 hrs |

---

## 🛣 Production Roadmap

### Phase 1 — Current (Web Demo) ✅
- [x] Voice assistant with wake word
- [x] Full booking flow
- [x] Razorpay payments
- [x] SQLite database
- [x] Claude AI conversation

### Phase 2 — Mobile App
- [ ] React Native port (Expo)
- [ ] Native wake word (Picovoice Porcupine)
- [ ] Push notifications for booking reminders
- [ ] Location auto-fill (Google Places API)
- [ ] OTP-based login

### Phase 3 — WhatsApp / Phone Integration
- [ ] Twilio/Meta WhatsApp Business API
- [ ] Twilio Voice for phone calls
- [ ] IVR fallback for no-internet users
- [ ] Multi-language support (Telugu, Hindi)

### Phase 4 — Enterprise
- [ ] Admin dashboard (booking management)
- [ ] Cleaner assignment & routing
- [ ] Real-time tracking
- [ ] CRM integration
- [ ] Analytics & reporting

---

## 🔒 Security Features
- Rate limiting (200 req/15min API, 30 msg/min chat)
- Helmet.js security headers
- CORS restricted to frontend origin
- Input validation on all endpoints
- Payment signature verification (Razorpay HMAC)

---

## 🛠 Tech Stack

**Backend:** Node.js, Express, better-sqlite3, Anthropic SDK, Razorpay  
**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons  
**AI:** Claude Sonnet (claude-sonnet-4-6) with 8 booking tools  
**Voice:** Web Speech API (SpeechRecognition + SpeechSynthesis)  
**Database:** SQLite (zero-config, file-based)  
**Payments:** Razorpay (demo mode available without keys)

---

*Built for Urban Klean — "Clean Spaces, Happy Places" 🧹*
