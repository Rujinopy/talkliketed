import {z} from 'zod';

import {createTRPCRouter, publicProcedure} from '~/server/api/trpc';
import { TRPCError } from '@trpc/server';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { clerkClient } from '@clerk/nextjs/server';
export const repsRouter = createTRPCRouter({
    hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
        return {
            greeting: `Hello ${input.text}`,
        };
        }
    ),

    getUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
        const { userId } = input
        const user: User | null = await ctx.prisma.pushups.findUnique({
            where: {
                userId: userId
            },
            select: {
                userId: true,
                count: true
            }
        })     
        if (!user) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'User not found',
            })
        }
    }),

    updateReps: publicProcedure
    .input(z.object({ userId: z.string(), count: z.number() }))
    .mutation(async ({ input, ctx }) => {
        const { userId, count } = input
        const user: User | null = await ctx.prisma.pushups.findUnique({
            where: {
                userId: userId
            },
            select: {
                userId: true,
                count: true
            }
        })     
        if (!user) {
            throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'User not found',
            })
        }
        await ctx.prisma.pushups.update({
            where: {
                userId: userId
            },
            data: {
                count: user.count + count
            }
        })
    }
    ),
})

interface User {
    userId: string,
    count: number
}