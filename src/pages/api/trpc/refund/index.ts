import type { NextApiRequest, NextApiResponse } from 'next'
import { CURRENCY, MIN_AMOUNT, MAX_AMOUNT } from '../../../../../config/config'
import { formatAmountForStripe } from '../../../../utils/stripe-helpers'
import { env } from '~/env.mjs'
import Stripe from 'stripe'
import { api } from '~/utils/api'
import { getAuth } from '@clerk/nextjs/server'
import { appRouter } from "../../../../server/api/root";
import { createTRPCContext } from "../../../../server/api/trpc";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
})

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { userId } = await getAuth(req)
    const ctx = await createTRPCContext({ req, res });
    const caller = await appRouter.createCaller(ctx);
    if (req.method === 'POST') {
        const data = await caller.reps.checkIfUserExists({ userId: userId ?? "" })
        const payment_intent = data?.payment_intent
        const pledge = data?.pledge ?? 0 
        try {
            const refundSession = await stripe.refunds.create({
                payment_intent: payment_intent ?? "" ,
                amount: pledge * 100
            });
            console.log(refundSession)
            res.status(200).json(refundSession)
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Internal server error'
            res.status(500).json({ statusCode: 500, message: errorMessage })
        }
    }
    else {
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method Not Allowed')
    }
}