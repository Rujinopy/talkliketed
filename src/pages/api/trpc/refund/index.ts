import type { NextApiRequest, NextApiResponse } from 'next'
import { env } from '~/env.mjs'
import Stripe from 'stripe'
import { getAuth } from '@clerk/nextjs/server'
import { appRouter } from "../../../../server/api/root";
import { createTRPCContext } from "../../../../server/api/trpc";
import { daysDifference } from '~/utils/dateHelpers'


const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
})


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { userId } = getAuth(req)
    const sD= req.body.startDate
    const eD =req.body.endDate
    const ctx = createTRPCContext({ req, res });
    const caller = appRouter.createCaller(ctx);
    
    const data = await caller.reps.checkIfUserExists({ userId: userId ?? "" })
   
    
    if(data === null){
        res.status(404).json({ statusCode: 404, message: "User not found" })
    }
    
    if(data != null) {
        const startDate = data?.startDate ?? sD
        const endDate = data?.endDate ?? eD
        const actualSessions = await caller.reps.getAllReps({
            startDate: startDate ?? new Date(),
            endDate: endDate ?? new Date(),
        })
        
    const payment_intent = data.payment_intent
    const pledge = data.pledge ?? 0
    const repsGoal = data.repsAmount ?? 0
    const refundAmount = calculatedRefundAmount(pledge, actualSessions, startDate, endDate, repsGoal)
    if (req.method === 'POST') {
        try { 
            const refundSession = await stripe.refunds.create({
                payment_intent: payment_intent ?? "",
                amount: refundAmount * 100,
                metadata: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                }
            });
            res.status(200).json(refundSession)
            console.log(actualSessions)
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
}

export const calculatedRefundAmount = (pledge: number, pushupSessions: Array<{ count: number | null }>
    , startDate: Date, endDate: Date, repsGoal: number) => {
    let incompletedDays = 0
    const totalDays = daysDifference(startDate, endDate) + 1    
        // console.log("days difference" + totalDays)
        for (let i = 0; i < totalDays; i++) {
            if (((pushupSessions[i]?.count ?? 0 ) < repsGoal)|| pushupSessions[i]?.count === null) {
                incompletedDays++;
            }
        }
        console.log(incompletedDays)
        console.log(totalDays)
        console.log(pledge)
        console.log(pushupSessions)
        
        return pledge - (incompletedDays * pledge / totalDays)
}



