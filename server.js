// JavaScript source code
process.env.STRIPE_SECRET_KEY = "sk_test_"
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());
app.use(cors());

// Endpoint to create a payment intent when a user books a photographer
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { amount, photographerId } = req.body;

        // Create a PaymentIntent with the amount (in cents) and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // e.g., 5000 cents = $50.00
            currency: 'usd',
            metadata: {
                photographer_id: photographerId
            }
        });

        // Send the clientSecret back to the mobile app
        res.status(200).send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Vura backend listening on port 3000!"));