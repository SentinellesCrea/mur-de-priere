// /app/api/donate/checkout-session/route.js
{/*import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { amount } = await request.json();

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Don pour Mur de Prière',
          },
          unit_amount: amount * 100, // Montant en centimes
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/don/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/don/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Erreur Stripe :", err);
    return NextResponse.json({ error: 'Erreur de paiement' }, { status: 500 });
  }
}
*/}