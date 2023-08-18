import {z} from 'zod';

import {createTRPCRouter, publicProcedure} from '~/server/api/trpc';

export const postsRouter = createTRPCRouter({
    stripeRetrieve: publicProcedure
    .input(z.object({ payment_intent_id: z.string() }))
    .query(async ({ input, ctx }) => {
        return await ctx.stripe.paymentIntents.retrieve(input.payment_intent_id);
    }
    ),

})