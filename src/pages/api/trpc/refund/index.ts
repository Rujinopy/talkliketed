import type { NextApiRequest, NextApiResponse } from 'next'
import { CURRENCY, MIN_AMOUNT, MAX_AMOUNT } from '../../../../../config/config'
import { formatAmountForStripe } from '../../../../utils/stripe-helpers'
import { env } from '~/env.mjs'
import Stripe from 'stripe'
import { api } from '~/utils/api'
import { getAuth } from '@clerk/nextjs/server'
import { appRouter } from "../../../../server/api/root";
import { createTRPCContext } from "../../../../server/api/trpc";
import { daysDifference } from '~/pages/utils/dateHelpers'
import { start } from 'repl'


const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
})

interface dataType {
    payment_intent: string
    pledge: number
    startDate: Date
    endDate: Date
    pledgeAmount: number
}



export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    
    const { userId } = await getAuth(req)
    const ctx = await createTRPCContext({ req, res });
    const caller = await appRouter.createCaller(ctx);
    
    const data = await caller.reps.checkIfUserExists({ userId: userId ?? "" })
    const startDate = data?.startDate ?? new Date()
    const endDate = data?.endDate ?? new Date()
    const actualSessions = await caller.reps.getAllReps({
        startDate: startDate!,
        endDate: endDate!
    })

    const payment_intent = data?.payment_intent
    const pledge = data!.pledge ?? 0
    const repsGoal = data!.repsAmount ?? 0
    const refundAmount = calculatedRefundAmount(pledge, actualSessions, startDate, endDate, repsGoal)
    console.log(actualSessions)
    console.log("refundamount" + refundAmount)
    if (req.method === 'POST') {

        try { 
            const refundSession = await stripe.refunds.create({
                payment_intent: payment_intent ?? "",
                amount: refundAmount! * 100
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



export const calculatedRefundAmount = (pledge: number, pushupSessions: Array<{ count: number | null }>
    , startDate: Date, endDate: Date, repsGoal: number) => {
    let incompletedDays = 0
    const totalDays = daysDifference(startDate, endDate)
        console.log("days difference" + totalDays)
    if (pushupSessions && pushupSessions.length > 0) {
        for (let i = 0; i < pushupSessions.length; i++) {
            
            if (((pushupSessions[i]?.count ?? 0 ) < repsGoal)|| pushupSessions[i]?.count === null) {
                incompletedDays++;
            }
        }
        console.log("incompletedDay" + incompletedDays)
        return pledge - (incompletedDays * pledge / totalDays)
    }

    
}



