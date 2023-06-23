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
            const inputDate = new Date(input.date);
            inputDate.setHours(inputDate.getHours() + 7);

            const todayReps = await ctx.prisma.pushups.findFirst({
                where: {
                    userId: ctx.auth?.userId,
                    date: new Date(inputDate.toISOString()),
                },
            });
            
            if ((todayReps === null) && ( role?.Role === "MEM" || role?.Role === "SUBS")) {
                console.log(todayReps)
                const rep = await ctx.prisma.pushups.create({
                    data: {
                        user: {
                            connect: {
                                userId: ctx.auth?.userId ?? "",
                            },
                        },
                        date: new Date(inputDate.toISOString()),
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
            const inputDate = new Date(input.date);
            inputDate.setHours(inputDate.getHours() + 7);

            const reps = await ctx.prisma.pushups.findFirst({
                where: {
                    userId: ctx.auth?.userId ?? input.userId,
                    date: new Date(inputDate.toISOString()),
                },
                select: {
                    count: true,
                    date:true,
                    user:{
                        select:{
                            repsAmount:true
                        }
                    }
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
                    Role: "MEM"
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
    .input (
        z.object({
            startDate: z.date(),
            endDate: z.date(),
        })
    )
    .query(async ({ input, ctx }) => {
        const reps = await ctx.prisma.pushups.findMany({
            where: {
                userId: ctx.auth?.userId ?? "",
                date: {
                    gte: input.startDate,
                    lte: input.endDate,
                },
            },
            select: {
                count: true,
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
            payment_intent: z.string(),
            startDate: z.date(),
            endDate: z.date()

        }))
    .mutation(async ({ input, ctx }) => {
        const user = await ctx.prisma.users.updateMany({
            where: {
                userId: input.userId ?? ctx.auth?.userId ,
            },
            data: {
                Role: "SUBS",
                pledge: input.pledge,
                payment_intent: input.payment_intent
            },
        });
        return user;
    }
    ),

    getAllRepsForUser: publicProcedure
    .input( z.object({
        startDate: z.date(),
        endDate: z.date(),
    }))
    .query(async ({ input, ctx }) => {
        
        const reps = await ctx.prisma.pushups.findMany({
            where:{
                userId: ctx.auth?.userId,
                date: {
                    gte: input.startDate,
                    lte: input.endDate,
                }
            },
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

    changeSubsToUser: publicProcedure
    .input(
        z.object({
            userId: z.string(),
            startDate: z.date(),
            endDate: z.date()
        }))
    .mutation(async ({input, ctx}) => {
        const user = await ctx.prisma.users.update({
            where:{
                userId: ctx.auth?.userId ?? input.userId
            },
            data:{
                Role: "USER",
                pledge: 0,
                payment_intent: "",
                startDate: null,
                endDate: null,
                repsAmount: 0
            }
        })

        const session = await ctx.prisma.activitiesSession.create({
            data: {
                userId: ctx.auth?.userId ?? input.userId,
                startDate: input.startDate,
                endDate: input.endDate

            }
        })
        return user;
    })
});

