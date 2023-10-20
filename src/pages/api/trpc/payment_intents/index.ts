import type { NextApiRequest, NextApiResponse } from 'next'
import { CURRENCY, MIN_AMOUNT, MAX_AMOUNT } from '../../../../../config/config'
import { formatAmountForStripe } from '../../../../utils/stripe-helpers'
import { env } from '~/env.mjs'
import Stripe from 'stripe'
import { redirect } from 'next/navigation'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: '2022-11-15',
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
    return
  }
  const { amount, payment_intent_id }: { amount: number, payment_intent_id?: string } = req.body as { amount: number, payment_intent_id?: string}
  // Validate the amount that was passed from the client.
  if (!(amount >= MIN_AMOUNT && amount <= MAX_AMOUNT)) {
    res.status(500).json({ statusCode: 400, message: 'Invalid amount.' })
    return
  }
  if (payment_intent_id) {
    try {
      const current_intent = await stripe.paymentIntents.retrieve(
        payment_intent_id
      )
      // If PaymentIntent has been created, just update the amount.
      if (current_intent) {
        const updated_intent = await stripe.paymentIntents.update(
          payment_intent_id,
          {
            amount: formatAmountForStripe(amount, CURRENCY),
            capture_method: 'manual',
          }
        )
        res.status(200).json(updated_intent)
      }
    } catch (e) {

      const errorMessage =
        e instanceof Error ? e.message : 'Internal server error'
      res.status(500).json({ statusCode: 500, message: errorMessage })

    }
  }
  console.log('payment_intent_id', payment_intent_id)
  if (!payment_intent_id) {
    try {
      // Create PaymentIntent from body params.
      const params: Stripe.PaymentIntentCreateParams = {
        amount: formatAmountForStripe(amount, CURRENCY),
        currency: CURRENCY,
        payment_method_types: ['card'],
      }
      console.log('params', params)
      const payment_intent = await stripe.paymentIntents.create(params) as Stripe.PaymentIntent;

      res.status(200).json(payment_intent)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Internal server error'
      res.status(500).json({ statusCode: 500, message: errorMessage })
    }
  }
}
