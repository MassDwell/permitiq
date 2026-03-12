import Stripe from 'stripe';
import { readFileSync } from 'fs';

// Load env
const env = readFileSync('.env.local', 'utf8');
const getEnv = (key) => env.match(new RegExp(`^${key}=(.+)$`, 'm'))?.[1]?.trim();

const stripe = new Stripe(getEnv('STRIPE_SECRET_KEY'));

const tiers = [
  {
    name: 'Solo — Founding Member',
    description: 'Up to 3 projects, 1 user, core compliance + AI extraction. Founding member rate locked forever.',
    founderPrice: 4900, // $49/mo
    regularPrice: 14900, // $149/mo
    founderKey: 'STRIPE_FOUNDER_SOLO_PRICE_ID',
    regularKey: 'STRIPE_SOLO_PRICE_ID',
  },
  {
    name: 'Developer — Founding Member',
    description: 'Up to 10 projects, 3 team members, AI research, inspection tracker. Founding member rate locked forever.',
    founderPrice: 9900, // $99/mo
    regularPrice: 34900, // $349/mo
    founderKey: 'STRIPE_FOUNDER_DEVELOPER_PRICE_ID',
    regularKey: 'STRIPE_DEVELOPER_PRICE_ID',
  },
  {
    name: 'Portfolio — Founding Member',
    description: 'Unlimited projects, unlimited team, API access. Founding member rate locked forever.',
    founderPrice: 19900, // $199/mo
    regularPrice: 74900, // $749/mo
    founderKey: 'STRIPE_FOUNDER_PORTFOLIO_PRICE_ID',
    regularKey: 'STRIPE_PORTFOLIO_PRICE_ID',
  },
];

console.log('Creating Stripe products and prices...\n');

for (const tier of tiers) {
  // Create product
  const product = await stripe.products.create({
    name: tier.name,
    description: tier.description,
    metadata: { app: 'meritlayer' },
  });
  console.log(`✅ Product: ${product.name} (${product.id})`);

  // Founder price
  const founderPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: tier.founderPrice,
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: `${tier.name} — Founding Member`,
    metadata: { tier: 'founder' },
  });
  console.log(`   ${tier.founderKey}=${founderPrice.id}`);

  // Regular price
  const regularPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: tier.regularPrice,
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: tier.name.replace(' — Founding Member', ''),
    metadata: { tier: 'regular' },
  });
  console.log(`   ${tier.regularKey}=${regularPrice.id}`);
  console.log('');
}

console.log('\nCopy the price IDs above into .env.local');
