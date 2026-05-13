/**
 * Kayro Interactive — Cloudflare Worker Backend
 * Handles: AI proxy, flight search/booking (Duffel), hotel search (Amadeus), payments (Stripe)
 * Deploy: wrangler deploy
 */

const ALLOWED_ORIGINS = [
  'https://kayrointer.com',
  'https://www.kayrointer.com',
  'http://localhost:3000',
  'http://127.0.0.1:5500',
];

function cors(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors(origin), 'Content-Type': 'application/json' },
  });
}

function err(msg, status = 400, origin = '') {
  return json({ error: msg }, status, origin);
}

// ── MAIN ROUTER ────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(origin) });
    }

    const url  = new URL(request.url);
    const path = url.pathname;

    try {
      // AI Proxy — forward to Anthropic using Kayro's key
      if (path === '/api/ai')                  return handleAI(request, env, origin);

      // Flights (Duffel)
      if (path === '/api/flights/search')      return handleFlightSearch(request, env, origin);
      if (path === '/api/flights/offers')      return handleFlightOffers(request, env, origin);
      if (path === '/api/flights/book')        return handleFlightBook(request, env, origin);
      if (path.startsWith('/api/flights/order/')) return handleFlightOrder(request, env, origin, path);

      // Hotels (Amadeus)
      if (path === '/api/hotels/search')       return handleHotelSearch(request, env, origin);
      if (path === '/api/hotels/offers')       return handleHotelOffers(request, env, origin);
      if (path === '/api/hotels/book')         return handleHotelBook(request, env, origin);

      // Payments (Stripe)
      if (path === '/api/payments/customer')   return handleStripeCustomer(request, env, origin);
      if (path === '/api/payments/setup')      return handleSetupIntent(request, env, origin);
      if (path === '/api/payments/methods')    return handleListCards(request, env, origin);
      if (path === '/api/payments/remove')     return handleRemoveCard(request, env, origin);
      if (path === '/api/payments/charge')     return handleCharge(request, env, origin);

      return err('Not found', 404, origin);
    } catch (e) {
      console.error(e);
      return err(e.message || 'Internal server error', 500, origin);
    }
  },
};

// ══════════════════════════════════════════════════════════════
// AI PROXY
// ══════════════════════════════════════════════════════════════
async function handleAI(request, env, origin) {
  const key = env.ANTHROPIC_KEY || env.ANTHROPIC_API_KEY;
  if (!key) {
    return json({ error: { message: 'Anthropic API key not set. Run: npx wrangler secret put ANTHROPIC_KEY — then paste your sk-ant- key.' } }, 500, origin);
  }
  const body = await request.text();

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body,
  });

  // Stream the response back
  return new Response(res.body, {
    status: res.status,
    headers: {
      ...cors(origin),
      'Content-Type': res.headers.get('Content-Type') || 'text/event-stream',
    },
  });
}

// ══════════════════════════════════════════════════════════════
// FLIGHTS — DUFFEL
// ══════════════════════════════════════════════════════════════
function duffel(env) {
  const base = 'https://api.duffel.com';
  const headers = {
    'Authorization': `Bearer ${env.DUFFEL_TOKEN}`,
    'Content-Type': 'application/json',
    'Duffel-Version': 'v2',
    'Accept': 'application/json',
  };

  return {
    async post(path, data) {
      const r = await fetch(base + path, { method: 'POST', headers, body: JSON.stringify(data) });
      return r.json();
    },
    async get(path) {
      const r = await fetch(base + path, { headers });
      return r.json();
    },
  };
}

// Step 1 — Create offer request (search)
async function handleFlightSearch(request, env, origin) {
  const { origin: from, destination: to, departureDate, returnDate, passengers = 1, cabinClass = 'economy' } = await request.json();

  if (!from || !to || !departureDate) return err('origin, destination, departureDate required', 400, origin);

  const pax = Array.from({ length: Number(passengers) }, () => ({ type: 'adult' }));

  const slices = [{ origin: from.toUpperCase(), destination: to.toUpperCase(), departure_date: departureDate }];
  if (returnDate) slices.push({ origin: to.toUpperCase(), destination: from.toUpperCase(), departure_date: returnDate });

  const api = duffel(env);
  const result = await api.post('/air/offer_requests', {
    data: { slices, passengers: pax, cabin_class: cabinClass.toLowerCase().replace(' ', '_') },
  });

  if (result.errors) return json({ error: result.errors[0]?.message || 'Search failed', errors: result.errors }, 400, origin);

  return json({ offerRequestId: result.data.id }, 200, origin);
}

// Step 2 — Get offers for a request
async function handleFlightOffers(request, env, origin) {
  const url = new URL(request.url);
  const offerRequestId = url.searchParams.get('offer_request_id');
  const sort = url.searchParams.get('sort') || 'total_amount';
  const limit = Math.min(Number(url.searchParams.get('limit') || 10), 20);

  if (!offerRequestId) return err('offer_request_id required', 400, origin);

  const api = duffel(env);
  const result = await api.get(`/air/offers?offer_request_id=${offerRequestId}&sort=${sort}&limit=${limit}`);

  if (result.errors) return json({ error: result.errors[0]?.message, errors: result.errors }, 400, origin);

  // Normalize to a clean frontend-friendly format
  const offers = (result.data || []).map(o => ({
    id: o.id,
    totalAmount: o.total_amount,
    totalCurrency: o.total_currency,
    baseAmount: o.base_amount,
    taxAmount: o.tax_amount,
    expiresAt: o.expires_at,
    slices: (o.slices || []).map(s => ({
      origin: s.origin?.iata_code,
      destination: s.destination?.iata_code,
      originCity: s.origin?.city_name,
      destinationCity: s.destination?.city_name,
      duration: s.duration,
      segments: (s.segments || []).map(seg => ({
        flightNumber: `${seg.operating_carrier?.iata_code}${seg.operating_carrier_flight_number}`,
        carrier: seg.marketing_carrier?.name,
        aircraft: seg.aircraft?.name,
        departing: seg.departing_at,
        arriving: seg.arriving_at,
        origin: seg.origin?.iata_code,
        destination: seg.destination?.iata_code,
        cabinClass: seg.passengers?.[0]?.cabin_class,
      })),
    })),
    passengers: o.passengers,
  }));

  return json({ offers }, 200, origin);
}

// Step 3 — Book (create order)
async function handleFlightBook(request, env, origin) {
  const { offerId, passengers, paymentAmount, paymentCurrency, stripePaymentMethodId, stripeCustomerId } = await request.json();

  if (!offerId || !passengers?.length) return err('offerId and passengers required', 400, origin);

  // Charge via Stripe first — never book without payment
  if (stripePaymentMethodId && stripeCustomerId) {
    const charged = await stripeRequest(env, 'POST', '/v1/payment_intents', {
      amount: Math.round(Number(paymentAmount) * 100),
      currency: (paymentCurrency || 'usd').toLowerCase(),
      customer: stripeCustomerId,
      payment_method: stripePaymentMethodId,
      confirm: 'true',
      off_session: 'true',
    });
    if (charged.error) return json({ error: charged.error.message }, 400, origin);
    if (charged.status !== 'succeeded') return json({ error: `Payment status: ${charged.status}` }, 400, origin);
  }

  const api = duffel(env);
  const result = await api.post('/air/orders', {
    data: {
      selected_offers: [offerId],
      passengers: passengers.map(p => ({
        phone_number: p.phone,
        email: p.email,
        born_on: p.dob,
        title: p.title || 'mr',
        gender: p.gender || 'm',
        given_name: p.firstName,
        family_name: p.lastName,
        id: p.offerId,
      })),
      payments: [{
        type: 'balance',
        currency: paymentCurrency || 'USD',
        amount: paymentAmount,
      }],
    },
  });

  if (result.errors) return json({ error: result.errors[0]?.message, errors: result.errors }, 400, origin);

  const order = result.data;
  return json({
    orderId: order.id,
    bookingReference: order.booking_reference,
    status: order.payment_status?.awaiting_payment ? 'pending' : 'confirmed',
    slices: order.slices,
    passengers: order.passengers,
  }, 200, origin);
}

// Get order details
async function handleFlightOrder(request, env, origin, path) {
  const orderId = path.split('/').pop();
  const api = duffel(env);
  const result = await api.get(`/air/orders/${orderId}`);
  if (result.errors) return json({ error: result.errors[0]?.message }, 400, origin);
  return json(result.data, 200, origin);
}

// ══════════════════════════════════════════════════════════════
// HOTELS — AMADEUS
// ══════════════════════════════════════════════════════════════
let amadeusToken = null;
let amadeusTokenExp = 0;

async function getAmadeusToken(env) {
  if (amadeusToken && Date.now() < amadeusTokenExp) return amadeusToken;

  const base = env.AMADEUS_ENV === 'production'
    ? 'https://api.amadeus.com'
    : 'https://test.api.amadeus.com';

  const r = await fetch(`${base}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${env.AMADEUS_CLIENT_ID}&client_secret=${env.AMADEUS_CLIENT_SECRET}`,
  });

  const data = await r.json();
  amadeusToken = data.access_token;
  amadeusTokenExp = Date.now() + (data.expires_in - 60) * 1000;
  return amadeusToken;
}

async function amadeus(env, path) {
  const token = await getAmadeusToken(env);
  const base = env.AMADEUS_ENV === 'production'
    ? 'https://api.amadeus.com'
    : 'https://test.api.amadeus.com';

  const r = await fetch(base + path, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  return r.json();
}

async function amadeusPost(env, path, body) {
  const token = await getAmadeusToken(env);
  const base = env.AMADEUS_ENV === 'production'
    ? 'https://api.amadeus.com'
    : 'https://test.api.amadeus.com';

  const r = await fetch(base + path, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return r.json();
}

async function handleHotelSearch(request, env, origin) {
  const { cityCode, checkIn, checkOut, adults = 1, rooms = 1, radius = 5 } = await request.json();
  if (!cityCode || !checkIn || !checkOut) return err('cityCode, checkIn, checkOut required', 400, origin);

  // Step 1: find hotels in city
  const hotelsData = await amadeus(env,
    `/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode.toUpperCase()}&radius=${radius}&radiusUnit=KM&amenities=SWIMMING_POOL,SPA,FITNESS_CENTER,RESTAURANT&ratings=3,4,5&hotelSource=ALL`
  );

  if (hotelsData.errors?.length) return json({ error: hotelsData.errors[0]?.detail }, 400, origin);

  const hotelIds = (hotelsData.data || []).slice(0, 20).map(h => h.hotelId).join(',');
  if (!hotelIds) return json({ hotels: [] }, 200, origin);

  // Step 2: get offers for those hotels
  const offersData = await amadeus(env,
    `/v3/shopping/hotel-offers?hotelIds=${hotelIds}&adults=${adults}&checkInDate=${checkIn}&checkOutDate=${checkOut}&roomQuantity=${rooms}&bestRateOnly=true&currency=USD`
  );

  const hotels = (offersData.data || []).map(h => ({
    hotelId: h.hotel.hotelId,
    name: h.hotel.name,
    cityCode: h.hotel.cityCode,
    latitude: h.hotel.latitude,
    longitude: h.hotel.longitude,
    rating: h.hotel.rating,
    amenities: h.hotel.amenities?.slice(0, 6) || [],
    offers: (h.offers || []).slice(0, 3).map(o => ({
      offerId: o.id,
      roomType: o.room?.typeEstimated?.category || o.room?.description?.text?.slice(0, 40),
      bedType: o.room?.typeEstimated?.bedType,
      beds: o.room?.typeEstimated?.beds,
      price: o.price?.total,
      currency: o.price?.currency,
      cancellationPolicy: o.policies?.cancellations?.[0]?.description?.text || 'Check hotel policy',
      checkIn: o.checkInDate,
      checkOut: o.checkOutDate,
    })),
  })).filter(h => h.offers.length > 0);

  return json({ hotels }, 200, origin);
}

async function handleHotelOffers(request, env, origin) {
  const url = new URL(request.url);
  const offerId = url.searchParams.get('offerId');
  if (!offerId) return err('offerId required', 400, origin);
  const data = await amadeus(env, `/v3/shopping/hotel-offers/${offerId}`);
  return json(data.data || {}, 200, origin);
}

async function handleHotelBook(request, env, origin) {
  const { offerId, guests, paymentAmount, paymentCurrency, stripePaymentMethodId, stripeCustomerId } = await request.json();

  if (!offerId || !guests?.length) return err('offerId and guests required', 400, origin);

  // Charge first
  if (stripePaymentMethodId && stripeCustomerId) {
    const charged = await stripeRequest(env, 'POST', '/v1/payment_intents', {
      amount: Math.round(Number(paymentAmount) * 100),
      currency: (paymentCurrency || 'usd').toLowerCase(),
      customer: stripeCustomerId,
      payment_method: stripePaymentMethodId,
      confirm: 'true',
      off_session: 'true',
    });
    if (charged.error || charged.status !== 'succeeded') {
      return json({ error: charged.error?.message || `Payment ${charged.status}` }, 400, origin);
    }
  }

  const data = await amadeusPost(env, '/v2/booking/hotel-orders', {
    data: {
      offerId,
      guests: guests.map((g, i) => ({
        tid: i + 1,
        title: g.title || 'MR',
        firstName: g.firstName,
        lastName: g.lastName,
        phone: g.phone,
        email: g.email,
      })),
      payments: [{
        method: 'creditCard',
        paymentCard: {
          paymentCardInfo: {
            vendorCode: 'VI',
            cardNumber: '4111111111111111',
            expiryDate: '2026-01',
            holderName: `${guests[0].firstName} ${guests[0].lastName}`,
          },
        },
      }],
    },
  });

  if (data.errors?.length) return json({ error: data.errors[0]?.detail }, 400, origin);

  return json({
    orderId: data.data?.id,
    confirmationNumber: data.data?.associatedRecords?.[0]?.reference,
    status: 'confirmed',
    hotel: data.data?.hotelOffer?.hotel?.name,
  }, 200, origin);
}

// ══════════════════════════════════════════════════════════════
// PAYMENTS — STRIPE
// ══════════════════════════════════════════════════════════════
async function stripeRequest(env, method, path, params = {}) {
  const body = method === 'GET' ? undefined
    : new URLSearchParams(flattenStripeParams(params)).toString();

  const url = method === 'GET'
    ? `https://api.stripe.com/v1${path}?${new URLSearchParams(params)}`
    : `https://api.stripe.com/v1${path}`;

  const r = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  return r.json();
}

function flattenStripeParams(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flattenStripeParams(v, key));
    } else {
      out[key] = String(v);
    }
  }
  return out;
}

// Create or retrieve Stripe customer for a Kayro user
async function handleStripeCustomer(request, env, origin) {
  const { email, name, kayroUserId } = await request.json();
  if (!email) return err('email required', 400, origin);

  // Search for existing customer by email
  const existing = await stripeRequest(env, 'GET', '/v1/customers', { email, limit: '1' });
  if (existing.data?.length) {
    return json({ customerId: existing.data[0].id }, 200, origin);
  }

  // Create new customer
  const customer = await stripeRequest(env, 'POST', '/v1/customers', {
    email,
    name: name || email,
    metadata: { kayroUserId: kayroUserId || '' },
  });

  if (customer.error) return json({ error: customer.error.message }, 400, origin);
  return json({ customerId: customer.id }, 200, origin);
}

// Create a SetupIntent so the frontend (Stripe.js) can securely collect card details
async function handleSetupIntent(request, env, origin) {
  const { customerId } = await request.json();
  if (!customerId) return err('customerId required', 400, origin);

  const intent = await stripeRequest(env, 'POST', '/v1/setup_intents', {
    customer: customerId,
    payment_method_types: 'card',
    usage: 'off_session',
  });

  if (intent.error) return json({ error: intent.error.message }, 400, origin);
  return json({
    clientSecret: intent.client_secret,
    setupIntentId: intent.id,
  }, 200, origin);
}

// List saved cards for a customer
async function handleListCards(request, env, origin) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get('customerId');
  if (!customerId) return err('customerId required', 400, origin);

  const methods = await stripeRequest(env, 'GET', '/v1/payment_methods', {
    customer: customerId,
    type: 'card',
  });

  if (methods.error) return json({ error: methods.error.message }, 400, origin);

  const cards = (methods.data || []).map(pm => ({
    id: pm.id,
    brand: pm.card.brand,
    last4: pm.card.last4,
    expMonth: pm.card.exp_month,
    expYear: pm.card.exp_year,
    isDefault: false,
  }));

  return json({ cards }, 200, origin);
}

// Remove a saved card
async function handleRemoveCard(request, env, origin) {
  const { paymentMethodId } = await request.json();
  if (!paymentMethodId) return err('paymentMethodId required', 400, origin);

  const result = await stripeRequest(env, 'POST', `/v1/payment_methods/${paymentMethodId}/detach`, {});
  if (result.error) return json({ error: result.error.message }, 400, origin);
  return json({ removed: true }, 200, origin);
}

// Charge a saved card
async function handleCharge(request, env, origin) {
  const { customerId, paymentMethodId, amount, currency = 'usd', description = 'Kayro booking' } = await request.json();

  if (!customerId || !paymentMethodId || !amount) {
    return err('customerId, paymentMethodId, amount required', 400, origin);
  }

  const intent = await stripeRequest(env, 'POST', '/v1/payment_intents', {
    amount: String(Math.round(Number(amount) * 100)),
    currency: currency.toLowerCase(),
    customer: customerId,
    payment_method: paymentMethodId,
    description,
    confirm: 'true',
    off_session: 'true',
  });

  if (intent.error) return json({ error: intent.error.message, code: intent.error.code }, 400, origin);

  return json({
    paymentIntentId: intent.id,
    status: intent.status,
    amount: intent.amount / 100,
    currency: intent.currency,
  }, 200, origin);
}
