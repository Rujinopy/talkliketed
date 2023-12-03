import type { NextApiRequest, NextApiResponse } from 'next'
import { CURRENCY, MIN_AMOUNT, MAX_AMOUNT } from '../../../../../config/config'   
import { formatAmountForStripe } from '../../../../utils/stripe-helpers'
import { env } from '~/env.mjs'
import Stripe from 'stripe'

interface PaymentRequestBody {
    amount: number;
    startDate: string
    endDate: string;
    repsAmount: number;
    situpsAmount: number;
    userId: string;
  }
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    // const {userId} = getAuth(req);
    const { amount, startDate, endDate, repsAmount, userId, situpsAmount}: PaymentRequestBody = req.body as PaymentRequestBody;

    try {
      // Validate the amount that was passed from the client.
      if (!(amount >= MIN_AMOUNT && amount <= MAX_AMOUNT)) {
        throw new Error('Invalid amount.')
      }
      // Create Checkout Sessions from body params.
      const params: Stripe.Checkout.SessionCreateParams = {
        submit_type: 'pay',
        payment_intent_data:{
          metadata:{
            userId: userId,
            startDate: startDate,
            endDate: endDate,
            pledge: amount,
            repsAmount: repsAmount,
            situpsAmount: situpsAmount
          }
        },
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
        success_url: `${req.headers.origin ?? ""}/result?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin ?? ""}/challenge`,
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

