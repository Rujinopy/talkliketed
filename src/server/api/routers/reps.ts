import { start } from "repl";
import { z } from "zod";
import { daysDifference } from "~/utils/dateHelpers";
import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
} from "~/server/api/trpc";

import { TRPCError } from "@trpc/server";

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
// Create a new ratelimiter, that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "30 s"),
    analytics: true,
  });
  

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

            const { success } = await ratelimit.limit(ctx.auth?.userId ?? input.userId);
            if(!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

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

            if ((todayReps === null) && (role?.Role === "MEM" || role?.Role === "SUBS")) {
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
                    date: true,
                    user: {
                        select: {
                            repsAmount: true
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
                repsAmount: z.number(),
            })
        )
        .mutation(async ({ input, ctx }) => {

            const { success } = await ratelimit.limit(ctx.auth?.userId ?? input.userId);
            if(!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
            const rep = await ctx.prisma.users.update({
                where: {
                    userId: ctx.auth?.userId ?? "",
                },
                data: {
                    startDate: input.startDate,
                    endDate: input.endDate,
                    repsAmount: input.repsAmount,
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
                    userId: ctx.auth?.userId ?? input.userId,
                },
                include: {
                    session: true,
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
        .input(
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
                pledge: z.string(),
                payment_intent: z.string(),
                startDate: z.date(),
                endDate: z.date(),
                repsAmount: z.string(),
            }))
        .mutation(async ({ input, ctx }) => {
            const user = await ctx.prisma.users.updateMany({
                where: {
                    userId: input.userId ?? ctx.auth?.userId,
                },
                data: {
                    Role: "SUBS",
                    pledge: parseInt(input.pledge),
                    payment_intent: input.payment_intent,
                    startDate: input.startDate,
                    endDate: input.endDate,
                    repsAmount: parseInt(input.repsAmount),
                },
            });
            return user;
        }
        ),

    getAllRepsForUser: publicProcedure
        .input(z.object({
            startDate: z.date(),
            endDate: z.date(),
        }))
        .query(async ({ input, ctx }) => {

            const reps = await ctx.prisma.pushups.findMany({
                where: {
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
            }))
        .mutation(async ({ input, ctx }) => {
            const user = await ctx.prisma.users.update({
                where: {
                    userId: ctx.auth?.userId ?? input.userId
                },
                data: {
                    Role: "USER",
                    pledge: 0,
                    payment_intent: "",
                    startDate: null,
                    endDate: null,
                    repsAmount: 0
                }
            })
            return user;
        }),

    addSessionHistory: publicProcedure
        .input(
            z.object({
                userId: z.string(),
                startDate: z.date(),
                endDate: z.date(),
                status: z.string(),
                pledge: z.number(),
            }))
        .mutation(async ({ input, ctx }) => {
            const session = await ctx.prisma.activitiesSession.create({
                data: {
                    userId: input.userId,
                    startDate: input.startDate,
                    endDate: input.endDate,
                    status: input.status === "FULL" ? "FULL" : (input.status === "NONE" ? "NONE" : "PARTIAL"),
                }
            })
            return session;
        }
        ),

    infiniteSessionHistory: publicProcedure
        .input(
            z.object({
                userId: z.string(),
                limit: z.number(),
                cursor: z.string().nullish()
            }))
        .query(async ({ input, ctx }) => {
            const session = await ctx.prisma.activitiesSession.findMany({
                where: {
                    userId: input.userId,
                },
                cursor: input.cursor ? { id: input.cursor } : undefined,
                take: input.limit + 1,
                orderBy: {
                    startDate: "asc"
                }

            })
            let nextCursor: typeof input.cursor | undefined = undefined
            if (session.length > input.limit) {
                const nextItem = session.pop()
                nextCursor = nextItem?.id
            }


            return {
                session,
                nextCursor
            }
        }
        ),

    isUserSuccess: publicProcedure
        .input(
            z.object({
                userId: z.string(),
                startDate: z.date(),
                endDate: z.date(),
            })
        )
        .query(async ({ input, ctx }) => {
            const user = await ctx.prisma.users.findFirst({
                where: {
                    userId: input.userId,
                },
                select: {
                    pushups: {
                        where: {
                            date: {
                                gte: input.startDate,
                                lte: input.endDate,
                            },
                        },
                        select: {
                            count: true,
                        },
                    },
                    repsAmount: true,
                    startDate: true,
                    endDate: true,
                }
            });

            const totalday = daysDifference(user?.startDate!, user?.endDate!) + 1;
            //check each day if user did enough reps equal or more than repsAmount
            let success = "NONE"
            let count = 0
            //if no any pushups record, return false
            if (user) {
                if (user.pushups.length === 0) {
                    return {
                        success,
                        count,
                        totalday
                    };
                }
                if (user.pushups === undefined) {
                    success = "UNDEFINED"
                    return {
                        success,
                        count,
                        totalday
                    };
                }
                for (let i = 0; i < user.pushups.length; i++) {
                    console.log(totalday)
                    //count completed days
                    if (user.pushups[i]?.count! ===  user.repsAmount! || user.pushups[i]?.count! > user.repsAmount!) {
                        count++;
                    }
                }
                //if count is not equal to totalday, return false means user is not success
                if (count !== totalday) {
                    success = "PARTIAL";
                }

                if( count === totalday) {
                    success = "FULL"
                }
            }

            else if(!user ) {
                success = "UNDEFINED"
            }
            //if user is not found, return false
            
            return {
                success,
                count,
                totalday
            };

        }
        ),

});

