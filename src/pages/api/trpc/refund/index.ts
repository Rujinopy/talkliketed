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
    // const { startDate, endDate, pledge, repsGoal, payment_intent } = req.body
    const ctx = createTRPCContext({ req, res });
    const caller = appRouter.createCaller(ctx);
    const data = await caller.reps.checkIfUserExists({ userId: userId ?? "" })
    if (data) {
        const { startDate, endDate, pledge, repsAmount, payment_intent } = data
        
        const userAllExercises = await caller.reps.getAllReps({
            startDate: new Date(startDate ?? ""),
            endDate: new Date(endDate ?? ""),
        })

        //refund amount is the difference between the pledge and the amount of reps the user has done
        const refundAmount = () => {
            let completedDay = 0
            const days = daysDifference(new Date(startDate!), new Date(endDate!)) + 1
            if (pledge !== null && pledge !== undefined) {
                const pledgePerDay = pledge / days;

                userAllExercises.forEach((exercise) => {
                    if (exercise.count) {
                        completedDay += 1;
                    }
                });
                return pledgePerDay * completedDay
            }


        }

        if (req.method === 'POST') {
            console.log("hey")
            try {
                if(refundAmount() === 0){
                    res.status(200).json({
                        id: "noRefund",
                        amount: 0,
                    })
                }
                const refundSession = await stripe.refunds.create({
                    payment_intent: payment_intent!,
                    amount: refundAmount(),
                    metadata: {
                        startDate: startDate!.toISOString(),
                        endDate: endDate!.toISOString(),
                    }
                });
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
}

