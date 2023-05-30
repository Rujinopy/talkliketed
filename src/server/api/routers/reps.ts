import {z} from 'zod';

import {createTRPCRouter, publicProcedure} from '~/server/api/trpc';

export const repsRouter = createTRPCRouter({
    createRepForUser: publicProcedure
    .input(z.object({
        userId: z.string(),
        date: z.date(),
        reps: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
        const rep = await ctx.prisma.pushups.create({
            data: {
                user: {
                    connect: {
                        userId: input.userId
                    }
                },
                date: input.date,
                count: input.reps
            }
        })
        console.log("success")
        return rep;
    }
    ),
    
    getRepsForUser: publicProcedure
    .input(z.object({
        userId: z.string(),
        date: z.date(),
    }))
    .query(async ({ input, ctx }) => {

        //if user is logged in, return reps for that user
        const reps = await ctx.prisma.pushups.findFirst({
            where: {
                userId: input.userId,
                date: input.date
            },
            select: {
                count: true
            }

        })
        return reps;
    }
    ),

    updateRepsForUser: publicProcedure
    .input(z.object({
        userId: z.string(),
        date: z.date(),
        reps: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
        const rep = await ctx.prisma.pushups.updateMany({
            where: {
                userId: input.userId,
                date: input.date
            },
            data: {
                count: input.reps
            }
        })
        return rep;
    }
    ),
    updateStartEndDates: publicProcedure
    .input(z.object({
        userId: z.string(),
        startDate: z.date(),
        endDate: z.date(),
    }))
    .mutation(async ({ input, ctx }) => {
        const rep = await ctx.prisma.users.update({
            where: {
                userId: input.userId
            },
            data: {
                startDate: input.startDate,
                endDate: input.endDate,
                Role: "MEM"
            }
        })
        return rep;
    }
    ),

    updateRoleToSubS: publicProcedure
    .mutation(async ({ ctx }) => {
        const rep = await ctx.prisma.users.update({
            where: {
                userId: ctx.auth.userId ?? ""
            },
            data: {
                Role: "SUBS" 
            }
        })
        return rep;
    }
    ),

    checkIfUserExists: publicProcedure
    .input(z.object({
        userId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
        const rep = await ctx.prisma.users.findFirst({
            where: {
                userId: input.userId
            }
        })


        return rep;
    }
    ),

    createUser: publicProcedure
    .mutation(async ({ ctx }) => {
        const user = await ctx.prisma.users.create({
            data: {
                userId: ctx.auth.userId ?? "",
                Role: "USER"
            }
        })
        return user;
    }
    ),

    createUserByUserId: publicProcedure
    .input(z.object({
        userId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
        const user = await ctx.prisma.users.create({
            data: {
                userId: input.userId,
                Role: "USER"
            }
        })
        return user;
    }
    ),
        


})

