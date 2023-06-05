import type { NextApiRequest, NextApiResponse } from 'next'
import { CURRENCY, MIN_AMOUNT, MAX_AMOUNT } from '../../../../../config/config'   
import { formatAmountForStripe } from '../../../../utils/stripe-helpers'
import { env } from '~/env.mjs'
import Stripe from 'stripe'

interface PaymentRequestBody {
    amount: number;
    // other properties
    }

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
})

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if(req.method === 'POST') {
        await stripe.refunds.create({
            payment_intent: 'pi_1JZ2ZvKqj6xKQJ7Z4QZ2ZvKqj6xKQJ7Z4Q',
        });
    }
}