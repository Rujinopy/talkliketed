/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextApiRequest, NextApiResponse } from 'next'
import { CURRENCY, MIN_AMOUNT, MAX_AMOUNT } from '../../../../../config/config'   
import { formatAmountForStripe } from '../../../../utils/stripe-helpers'
import { env } from '~/env.mjs'
import Stripe from 'stripe'
import { getAuth } from "@clerk/nextjs/server";
interface PaymentRequestBody {
    amount: number;
  }
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const {userId} = getAuth(req);
    const { amount }: PaymentRequestBody = req.body;
    
    try {
      // Validate the amount that was passed from the client.
      if (!(amount >= MIN_AMOUNT && amount <= MAX_AMOUNT)) {
        throw new Error('Invalid amount.')
      }
      // Create Checkout Sessions from body params.
      const params: Stripe.Checkout.SessionCreateParams = {
        submit_type: 'donate',
        metadata: {
          userId: userId
        },
        payment_method_types: ['card'],
        line_items: [
          { 
            price_data: {
              currency: CURRENCY,
              product_data: {
                name: 'Pledge amount',
              },
              unit_amount: formatAmountForStripe(amount, CURRENCY),
            },
            quantity: 1,
          }
        ],
        mode: 'payment',
        success_url: `${req.headers.origin}/result?session_id={CHECKOUT_SESSION_ID}`,
        // cancel_url: `${req.headers.origin}/donate-with-checkout`,
        // success_url: `${req.headers.origin}/`,
        cancel_url: `${req.headers.origin}/subscription`,
      }

      const checkoutSession: Stripe.Checkout.Session =
        await stripe.checkout.sessions.create(params)

      res.status(200).json(checkoutSession)
      
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Internal server error'
      res.status(500).json({ statusCode: 500, message: errorMessage })
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}

