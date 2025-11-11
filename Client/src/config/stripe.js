import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SPTiHRWsVspYjV3IsUNXfIa4pn0AZTbjgr1ssXSdkEXgb4kHMdekTVnSAMottqIWsAXkU5s7jq1U1ttbap1SUXa00UyD80kVp');

export default stripePromise;
