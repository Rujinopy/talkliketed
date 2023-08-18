import { NextApiRequest, NextApiResponse } from 'next'

import Stripe from 'stripe'
import { stripe } from '../../../../../lib/stripe'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id: string = req.query.id as string
  console.log("kuy")
  try {
    if (!id.startsWith('pi_')) {
      throw Error('Incorrect paymentIntent ID.')
    }

    const paymentIntent: Stripe.PaymentIntent =
    await stripe.paymentIntents.retrieve(id)

    res.status(200).json(paymentIntent)
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Internal server error'
    res.status(500).json({ statusCode: 500, message: errorMessage })
  }
}