import {z} from 'zod';

import {createTRPCRouter, publicProcedure} from '~/server/api/trpc';
import { clerkClient } from '@clerk/nextjs/server';


export const postsRouter = createTRPCRouter({
    hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
    getAll: publicProcedure.query(async ({ ctx }) => {
        const users = await clerkClient.users.getUserList()
        console.log("server")
        console.log(users)
        return ctx.prisma.posts.findMany();
    }
    )
    ,
    //delete posts that was checked input = set of id
    delete: publicProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
        return await ctx.prisma.posts.delete({
            where: {
                id: input
            }
        });
    }),

    stripeRetrieve: publicProcedure
    .input(z.object({ payment_intent_id: z.string() }))
    .query(async ({ input, ctx }) => {
        return await ctx.stripe.paymentIntents.retrieve(input.payment_intent_id);
    }
    ),

})