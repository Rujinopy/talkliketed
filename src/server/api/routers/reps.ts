import { z } from "zod";

import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
} from "~/server/api/trpc";

export const repsRouter = createTRPCRouter({
    createRepForUser: publicProcedure
        .input(
            z.object({
                userId: z.string(),
                date: z.date(),
                reps: z.number(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            //create only when user's role are "SUBS" or "MEM"
            const role = await ctx.prisma.users.findFirst({
                where: {
                    userId: ctx.auth?.userId ?? input.userId,
                },
                select: {
                    Role: true,
                },
            });

            const todayReps = await ctx.prisma.pushups.findFirst({
                where: {
                    userId: ctx.auth?.userId,
                    date: input.date,
                },
            });

            if (todayReps === null) {
                const rep = await ctx.prisma.pushups.create({
                    data: {
                        user: {
                            connect: {
                                userId: ctx.auth?.userId ?? "",
                            },
                        },
                        date: input.date,
                        count: input.reps,
                    },
                });
                console.log("success");
                return rep;
            } else if (role?.Role === "USER") {
                console.log("user is not subscribed");
                return null;
            }
        }),
    getRepsForUser: publicProcedure
        .input(
            z.object({
                userId: z.string(),
                date: z.date(),
            })
        )
        .query(async ({ input, ctx }) => {
            //if user is logged in, return reps for that user
            const reps = await ctx.prisma.pushups.findFirst({
                where: {
                    userId: input.userId ?? ctx.auth?.userId,
                    date: input.date,
                },
                select: {
                    count: true,
                },
            });
            return reps;
        }),

    updateRepsForUser: publicProcedure
        .input(
            z.object({
                date: z.date(),
                reps: z.number(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const rep = await ctx.prisma.pushups.updateMany({
                where: {
                    userId: ctx.auth?.userId ?? "",
                    date: input.date,
                },
                data: {
                    count: input.reps,
                },
            });
            return rep;
        }),
    updateStartEndDates: publicProcedure
        .input(
            z.object({
                userId: z.string(),
                startDate: z.date(),
                endDate: z.date(),
                repPerDay: z.number(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const rep = await ctx.prisma.users.update({
                where: {
                    userId: ctx.auth?.userId ?? "",
                },
                data: {
                    startDate: input.startDate,
                    endDate: input.endDate,
                    repsAmount: input.repPerDay,
                },
            });
            return rep;
        }),

    checkIfUserExists: publicProcedure
        .input(
            z.object({
                userId: z.string(),
            })
        )
        .query(async ({ input, ctx }) => {
            const rep = await ctx.prisma.users.findFirst({
                where: {
                    userId: input.userId,
                },
            });
            return rep;
        }),

    createUser: publicProcedure.mutation(async ({ ctx }) => {
        const user = await ctx.prisma.users.create({
            data: {
                userId: ctx.auth?.userId ?? "",
                Role: "USER",
            },
        });
        return user;
    }),

    createUserByUserId: publicProcedure
        .input(
            z.object({
                userId: z.string(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const user = await ctx.prisma.users.create({
                data: {
                    userId: input.userId,
                    Role: "USER",
                },
            });
            return user;
        }),

    checkIfUserIsMem: publicProcedure
    .input(
        z.object({
            userId: z.string(),
        })
    )
    .query(async ({ ctx, input }) => {
        const user = await ctx.prisma.users.findFirst({
            where: {
                userId: input.userId,
            },
        });
        return user?.Role;
    }),

    checkUserRoleWithoutId: publicProcedure
    .query(async ({ ctx }) => {
        const user = await ctx.prisma.users.findFirst({
            where: {
                userId: ctx.auth?.userId ?? "",
            },
        });
        return user?.Role;
    }
    ),

    getAllReps: publicProcedure
    .query(async ({ ctx }) => {
        const reps = await ctx.prisma.pushups.findMany({
            select: {
                userId: true,
            },
        });
        return reps;
    }
    ),

    changeUserToMem: publicProcedure
    .mutation(async ({ ctx }) => {
        //chage user's role to "MEM" if user is "USER"
        const user = await ctx.prisma.users.updateMany({
            where: {
                userId: ctx.auth?.userId ?? "",
                Role: "USER",
            },
            data: {
                Role: "MEM",
            },
        });
        return user;
    }
    ),

    changeUserToSubs: publicProcedure
    .input(
        z.object({
            userId: z.string(),
            pledge: z.number(),
        }))
    .mutation(async ({ input, ctx }) => {
        const user = await ctx.prisma.users.updateMany({
            where: {
                userId: input.userId ?? ctx.auth?.userId ,
            },
            data: {
                Role: "SUBS",
                pledge: input.pledge,
            },
        });
        return user;
    }
    ),

    getAllRepsForUser: publicProcedure
    .query(async ({ ctx }) => {
        const reps = await ctx.prisma.pushups.findMany({
            select: {
                userId: true,
                count: true,
                date: true,
            },
            orderBy: {
                date: "asc",
            },
        });
        return reps;
    }
    ),
});

