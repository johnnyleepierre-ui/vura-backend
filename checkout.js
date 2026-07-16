// JavaScript source code
// Function to handle booking a photographer and opening the checkout screen
async function payForPhotographer(amountInDollars, photographerId) {
    try {
        // 1. Tell your backend to create a Payment Intent
        const response = await fetch('http://localhost:3000/api/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amountInDollars * 100, // Convert to cents (e.g., $50 = 5000)
                photographerId: photographerId
            }),
        });

        const data = await response.json();
        const clientSecret = data.clientSecret;

        console.log("Stripe Payment Token Created Successfully:", clientSecret);

    } catch (error) {
        console.error("Payment initiation failed:", error);
    }
}