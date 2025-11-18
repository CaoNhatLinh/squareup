/*
  Pre-seed Stripe product/price mappings for existing menu items.
  This helps avoid creating duplicate Stripe products/prices for the same item.

  Usage:
    STRIPE_SECRET_KEY=sk_test_xxx node ./src/scripts/preseedStripeProductMappings.js
*/
const path = require('path');
const { admin, db } = require('../src/config/firebaseAdmin');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function run() {
  try {
    console.log('Starting preseed of Stripe product mappings');
    const restaurantsSnapshot = await db.ref('restaurants').get();
    const restaurants = restaurantsSnapshot.val() || {};
    for (const [restaurantId, restaurant] of Object.entries(restaurants)) {
      const itemsSnap = await db.ref(`restaurants/${restaurantId}/items`).get();
      const items = itemsSnap.exists() ? itemsSnap.val() : {};
      for (const [itemId, item] of Object.entries(items)) {
        try {
          const priceVal = Number(item.price || 0);
          if (!priceVal || priceVal <= 0) continue;
          const keyPath = `stripeProducts/${restaurantId}/${itemId}/${Math.round(priceVal * 100)}`;
          const existing = await db.ref(keyPath).get();
          if (existing.exists()) {
            continue; // Already created
          }
          console.log(`Creating Stripe product/price for ${restaurantId}/${itemId} @ $${priceVal}`);
          const product = await stripe.products.create({ name: item.name || `Item ${itemId}`, description: item.description || undefined });
          const price = await stripe.prices.create({ product: product.id, unit_amount: Math.round(priceVal * 100), currency: 'usd' });
          await db.ref(keyPath).set({ productId: product.id, priceId: price.id, unitAmount: Math.round(priceVal * 100) });
        } catch (errItem) {
          console.error('Failed prepping item mapping', errItem && errItem.message);
        }
      }
    }
    console.log('Done pre-seeding Stripe product mappings');
    process.exit(0);
  } catch (err) {
    console.error('Preseed failed', err);
    process.exit(1);
  }
}

run();
