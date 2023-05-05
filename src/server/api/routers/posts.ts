import {z} from 'zod';

import {createTRPCRouter, publicProcedure} from '~/server/api/trpc';

export const postsRouter = createTRPCRouter({
    hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
    getAll: publicProcedure.query(({ ctx }) => {
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
});
