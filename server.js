const express = require('express');
const cors = require('cors');
// Fixed: Securely references environment variables to pass GitHub's scanner safely
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());
app.use(cors());

// 1. ENDPOINT: Onboard a New Seller (Creates their unique sub-account)
app.post('/onboard-seller', async (req, res) => {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'https://onrender.com',
      return_url: 'https://onrender.com',
      type: 'account_onboarding',
    });

    res.json({ stripeAccountId: account.id, onboardingUrl: accountLink.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. ENDPOINT: Split Checkout (Takes payment, pays seller, takes your platform fee)
app.post('/create-marketplace-checkout', async (req, res) => {
  try {
    const { amount, sellerStripeId, platformFeeAmount } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Marketplace Purchase' },
            unit_amount: amount, // Total amount in cents (e.g., 1000 = $10.00)
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFeeAmount, // Your cut in cents (e.g., 100 = $1.00)
        transfer_data: {
          destination: sellerStripeId, // Routes the share to the seller automatically!
        },
      },
      success_url: 'https://onrender.com',
      cancel_url: 'https://onrender.com',
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Root check endpoint
app.get('/', (req, res) => {
  res.send('Vura Multi-Vendor Marketplace Engine is Online.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Marketplace Server running on port ${PORT}`));
