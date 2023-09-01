import { NextApiRequest, NextApiResponse } from 'next'
import { verifySignature } from "@upstash/qstash/nextjs";
import { env } from '~/env.mjs'
import { appRouter } from "../../../../server/api/root";
import { createTRPCContext } from "../../../../server/api/trpc";
import { daysDifference } from '~/utils/dateHelpers'
//interface array of users


async function handler(req: NextApiRequest, res: NextApiResponse) {
    // const tokenFromRequest = req.headers.authorization

    // if(tokenFromRequest !== process.env.QSTASH_TOKEN) {
    //     return res.status(401).json({ message: 'Unauthorized' })
    // }
    const ctx = createTRPCContext({ req, res });
    const caller = appRouter.createCaller(ctx);


    const users = await caller.reps.isTodayYourEndDate();


    for (const user of users) {
        const { currentExcercises } = await caller.reps.getAllReps({
            startDate: new Date(user.startDate ?? ""),
            endDate: new Date(user.endDate ?? ""),
        })
        if (user.endDate === new Date(new Date().toISOString().slice(0, 10))) {
            //refund user
        }
    }
}

export default verifySignature(handler);

export const config = {
    api: {
        bodyParser: false,
    },
};