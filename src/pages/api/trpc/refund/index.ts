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
                if(userAllExercises.length === 0 || userAllExercises === undefined || userAllExercises === null){
                    return {
                        status: "NONE",
                        amount: 0,
                    }
                }
                
             for (const exercise of userAllExercises)  {
                    if (exercise.count === null || repsAmount === null) {
                        return {
                            status: "NONE",
                            amount: 0,
                        }
                    }
                    if (exercise.count > repsAmount || exercise.count === repsAmount) {
                        completedDay += 1;
                    }

                }
                if (completedDay === 0) {
                    console.log("no")
                    return {
                        status: "NONE",
                        amount: 0,
                    }
                }
                if (completedDay === days) {
                    return {
                        status: "FULL",
                        amount: pledgePerDay * completedDay,
                    }
                }
                if (completedDay < days) {
                    return {
                        status: "PARTIAL",
                        amount: pledgePerDay * completedDay,
                    }
                }

            }


        }

        if (req.method === 'POST') {
            try {
                const refundAmountResult = refundAmount();
                if(refundAmountResult === undefined || refundAmountResult === null) {
                    throw Error("something went wrong. Maybe no pushups session was found.")
                }
                if (refundAmountResult.amount === 0 || refundAmountResult.amount === undefined || refundAmountResult.amount === null) {
                    res.status(200).json({
                        id: "NONE",
                        amount: 0,
                    })
                }
                if(payment_intent === null || payment_intent === undefined) {
                    throw Error("something went wrong. Maybe no payment intent was found.")
                }

                if(startDate === null || startDate === undefined || endDate === null || endDate === undefined) {
                    throw Error("something went wrong. Maybe no start or end date was found.")
                }
                const refundSession = await stripe.refunds.create({
                    payment_intent: payment_intent,
                    amount: (refundAmountResult.amount * 100) - (pledge! * 6 / 100),
                    metadata: {
                        startDate: startDate.toISOString(),
                        endDate: endDate.toISOString(),
                        status: refundAmountResult.status,
                        pledge: pledge,
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

