const Anthropic = require('@anthropic-ai/sdk');
const { dbOps } = require('../db/database');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Dino, the friendly and professional voice assistant for Urban Klean, a premium home and commercial cleaning service in Hyderabad, India.

## Your Personality
- Warm, conversational, and helpful — like talking to a knowledgeable friend
- Concise when speaking (this is voice, not text — keep responses under 3 sentences unless listing items)
- Use natural speech patterns: "Sure!", "Absolutely!", "Great choice!", "Let me check that for you"
- Address customers by their name once you know it
- Occasionally use light Indian English expressions naturally
- Always stay positive and solution-oriented

## Urban Klean Business Details
- Location: Hyderabad, India
- Operating hours: Monday–Sunday, 8 AM to 8 PM
- Phone: 1800-XXX-XXXX (toll free)
- Website: urbanklean.in
- Tagline: "Clean Spaces, Happy Places"
- Trusted by 50,000+ customers across Hyderabad

## Conversation Flow
1. **Greeting**: Welcome the customer, ask how you can help
2. **Identify Need**: Understand what service they need (new booking, check history, offers, general inquiry)
3. **Service Selection**: Help them pick the right service and variant (flat size for home cleaning, etc.)
4. **Scheduling**: Ask for preferred date and time slot
5. **Address**: Confirm service address
6. **Offer Check**: Proactively apply best available offer
7. **Confirm & Pay**: Summarize booking and initiate payment
8. **Closing**: Thank them, share booking reference, wish them well

## Rules
- Always use tools to get real data — don't make up prices, availability, or offers
- If unsure about something, say you'll check and use a tool
- For bookings, always confirm all details before calling create_booking
- Never mention competitor services
- If customer is frustrated, empathize first before problem-solving
- Keep voice responses SHORT — use "Would you like me to tell you more?" for details
- Payment is always collected before confirming the booking

## Voice Response Format
- No markdown, no bullet points in spoken responses
- Short sentences, natural pauses
- Numbers spoken naturally (1499 rupees = "fourteen ninety-nine rupees")
- Dates spoken naturally ("this Saturday, May 11th")`;

const tools = [
  {
    name: 'get_services',
    description: 'Get all available cleaning services with pricing and details',
    input_schema: {
      type: 'object',
      properties: {
        category: { type: 'string', enum: ['home', 'specialty', 'commercial', 'all'] }
      },
      required: []
    }
  },
  {
    name: 'get_service_details',
    description: 'Get detailed information about a specific service',
    input_schema: {
      type: 'object',
      properties: {
        service_name: { type: 'string' }
      },
      required: ['service_name']
    }
  },
  {
    name: 'get_active_offers',
    description: 'Get all currently active promotional offers',
    input_schema: { type: 'object', properties: {} }
  },
  {
    name: 'apply_offer',
    description: 'Validate and apply an offer code',
    input_schema: {
      type: 'object',
      properties: {
        offer_code: { type: 'string' },
        order_amount: { type: 'number' }
      },
      required: ['offer_code', 'order_amount']
    }
  },
  {
    name: 'check_availability',
    description: 'Check available time slots for a given date',
    input_schema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'YYYY-MM-DD format' }
      },
      required: ['date']
    }
  },
  {
    name: 'get_customer_history',
    description: 'Get past bookings for a customer by phone number',
    input_schema: {
      type: 'object',
      properties: {
        phone: { type: 'string' }
      },
      required: ['phone']
    }
  },
  {
    name: 'create_booking',
    description: 'Create a new service booking after all details are confirmed',
    input_schema: {
      type: 'object',
      properties: {
        customer_name: { type: 'string' },
        customer_phone: { type: 'string' },
        customer_email: { type: 'string' },
        service_id: { type: 'number' },
        service_name: { type: 'string' },
        variant: { type: 'string' },
        address: { type: 'string' },
        scheduled_date: { type: 'string' },
        time_slot: { type: 'string' },
        base_amount: { type: 'number' },
        discount_amount: { type: 'number' },
        total_amount: { type: 'number' },
        offer_code: { type: 'string' },
        notes: { type: 'string' }
      },
      required: ['customer_name', 'customer_phone', 'service_id', 'service_name', 'address', 'scheduled_date', 'time_slot', 'base_amount', 'total_amount']
    }
  },
  {
    name: 'get_booking_status',
    description: 'Get the current status of a booking by reference number',
    input_schema: {
      type: 'object',
      properties: {
        booking_ref: { type: 'string' }
      },
      required: ['booking_ref']
    }
  }
];

function executeTool(toolName, toolInput) {
  switch (toolName) {
    case 'get_services': {
      const services = dbOps.getAllServices(toolInput.category);
      return services.map(s => ({
        id: s.id, name: s.name, category: s.category, icon: s.icon,
        base_price: s.base_price, duration_mins: s.duration_mins,
        pricing_variants: s.pricing_variants, highlights: s.highlights,
        description: s.description
      }));
    }

    case 'get_service_details': {
      const service = dbOps.getServiceByName(toolInput.service_name);
      return service || { error: 'Service not found' };
    }

    case 'get_active_offers': {
      return dbOps.getActiveOffers();
    }

    case 'apply_offer': {
      const { offer_code, order_amount } = toolInput;
      const offer = dbOps.getOfferByCode(offer_code);
      if (!offer) return { valid: false, message: 'Invalid or expired offer code' };
      if (order_amount < offer.min_order) {
        return { valid: false, message: `Minimum order of ${offer.min_order} rupees required for this offer` };
      }
      let discount = offer.discount_type === 'percent'
        ? Math.round(order_amount * offer.discount_value / 100)
        : offer.discount_value;
      if (offer.max_discount) discount = Math.min(discount, offer.max_discount);
      return {
        valid: true,
        offer_code: offer.code,
        title: offer.title,
        discount_amount: discount,
        final_amount: order_amount - discount,
        message: `${offer.title} applied! You save ${discount} rupees`
      };
    }

    case 'check_availability': {
      const { date } = toolInput;
      const allSlots = [
        '08:00 AM - 11:00 AM',
        '09:00 AM - 12:00 PM',
        '11:00 AM - 02:00 PM',
        '01:00 PM - 04:00 PM',
        '02:00 PM - 05:00 PM',
        '04:00 PM - 07:00 PM'
      ];
      const booked = new Set(dbOps.getBookedSlots(date));
      const available = allSlots.filter(s => !booked.has(s));
      return { date, available_slots: available, total_available: available.length };
    }

    case 'get_customer_history': {
      const customer = dbOps.getCustomerByPhone(toolInput.phone);
      if (!customer) return { customer: null, bookings: [] };
      const bookings = dbOps.getBookingsByCustomer(customer.id);
      return {
        customer: { name: customer.name, phone: customer.phone, email: customer.email },
        bookings: bookings.map(b => ({
          booking_ref: b.booking_ref, service: b.service_name, variant: b.variant,
          date: b.scheduled_date, slot: b.time_slot, status: b.status,
          total: b.total_amount, payment_status: b.payment_status
        })),
        total_bookings: bookings.length
      };
    }

    case 'create_booking': {
      const input = toolInput;
      const bookingRef = `UKL-${Date.now().toString(36).toUpperCase()}`;

      let customer = dbOps.getCustomerByPhone(input.customer_phone);
      if (!customer) {
        customer = dbOps.createCustomer({ phone: input.customer_phone, name: input.customer_name, email: input.customer_email });
      } else if (input.customer_name) {
        dbOps.updateCustomer(customer.id, { name: input.customer_name });
      }

      const booking = dbOps.createBooking({
        booking_ref: bookingRef,
        customer_id: customer.id,
        service_id: input.service_id,
        service_name: input.service_name,
        variant: input.variant || null,
        address: input.address,
        scheduled_date: input.scheduled_date,
        time_slot: input.time_slot,
        base_amount: input.base_amount,
        discount_amount: input.discount_amount || 0,
        total_amount: input.total_amount,
        offer_code: input.offer_code || null,
        notes: input.notes || null
      });

      dbOps.markSlotBooked(input.scheduled_date, input.time_slot, booking.id);

      return {
        success: true,
        booking_ref: bookingRef,
        customer_name: input.customer_name,
        service: input.service_name,
        variant: input.variant,
        date: input.scheduled_date,
        time_slot: input.time_slot,
        total_amount: input.total_amount,
        message: `Booking confirmed! Your reference is ${bookingRef}`
      };
    }

    case 'get_booking_status': {
      const booking = dbOps.getBookingByRef(toolInput.booking_ref);
      if (!booking) return { found: false, message: 'Booking not found' };
      return {
        found: true,
        booking_ref: booking.booking_ref,
        service: booking.service_name,
        variant: booking.variant,
        date: booking.scheduled_date,
        time_slot: booking.time_slot,
        status: booking.status,
        total: booking.total_amount,
        payment_status: booking.payment_status
      };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

async function runConversation(messages) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools,
    messages
  });

  if (response.stop_reason === 'tool_use') {
    const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');
    const toolResults = toolUseBlocks.map(toolUse => ({
      type: 'tool_result',
      tool_use_id: toolUse.id,
      content: JSON.stringify(executeTool(toolUse.name, toolUse.input))
    }));

    return runConversation([
      ...messages,
      { role: 'assistant', content: response.content },
      { role: 'user', content: toolResults }
    ]);
  }

  const textContent = response.content.find(b => b.type === 'text');
  return {
    reply: textContent?.text || "I'm sorry, I had trouble understanding that. Could you say that again?",
    usage: response.usage
  };
}

module.exports = { runConversation };
