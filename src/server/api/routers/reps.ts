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
                mode: z.string(),
            })
        )
        .mutation(async ({ input, ctx }) => {

            const { success } = await ratelimit.limit(ctx.auth?.userId ?? input.userId);
            if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

            //create only when user's role are "SUBS" or "MEM"
            const role = await ctx.prisma.users.findFirst({
                where: {
                    userId: ctx.auth?.userId ?? input.userId,
                },
                select: {
                    Role: true,
                },
            });
            const todayReps = await ctx.prisma.exercises.findFirst({
                where: {
                    userId: ctx.auth?.userId,
                    date: input.date,
                },
            });

            if ((role?.Role === "MEM" || role?.Role === "SUBS")) {
                let rep
                if (todayReps === null) {
                    rep = await ctx.prisma.exercises.create({
                        data: {
                            user: {
                                connect: {
                                    userId: ctx.auth?.userId ?? "",
                                },
                            },
                            date: input.date,
                            pushupsCount: input.reps,
                            situpsCount: input.reps,
                            weightLiftingCount: input.reps,
                        },
                    });

                    return rep;
                }

            } else if (role?.Role === "USER") {
                console.log("user haven't set any challenge yet.");
                return null;
            }
        }),
    getRepsForUser: publicProcedure
        .input(
            z.object({
                userId: z.string(),
                date: z.date(),
                mode: z.string(),
            })
        )
        .query(async ({ input, ctx }) => {
            const user = await ctx.prisma.users.findFirst({
                where: {
                    userId: ctx.auth?.userId ?? input.userId,
                },
                select: {
                    Role: true,
                    repsAmount: true,
                    situpsAmount: true,
                },
            });

            const reps = await ctx.prisma.exercises.findFirst({
                where: {
                    userId: ctx.auth?.userId ?? input.userId,
                    date: input.date
                },
                select: {
                    pushupsCount: true,
                    situpsCount: true,
                    weightLiftingCount: true,
                    date: true,

                },
            });

            return {
                reps,
                user
            };
        }),

    updateRepsForUser: protectedProcedure
        .input(
            z.object({
                date: z.date(),
                reps: z.number(),
                mode: z.string(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            // const inputDate = new Date(input.date);
            // inputDate.setHours(inputDate.getHours() + 7);
            let rep
            if (input.mode === "push-ups") {
                rep = await ctx.prisma.exercises.updateMany({
                    where: {
                        userId: ctx.auth?.userId ?? "",
                        date: input.date,
                    },
                    data: {
                        pushupsCount: input.reps,
                    },
                });
            }
            else if (input.mode === "sit-ups") {
                rep = await ctx.prisma.exercises.updateMany({
                    where: {
                        userId: ctx.auth?.userId ?? "",
                        date: input.date,
                    },
                    data: {
                        situpsCount: input.reps,
                    },
                });
            }
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
            if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
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
            const currentExcercises = await ctx.prisma.exercises.findMany({
                where: {
                    userId: ctx.auth?.userId ?? "",
                    date: {
                        gte: input.startDate,
                        lte: input.endDate,
                    },
                },
                select: {
                    pushupsCount: true,
                    situpsCount: true,
                },

            });

            return {
                currentExcercises,
            }
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
                situpsAmount: z.string(),
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
                    situpsAmount: parseInt(input.situpsAmount),
                },
            });
            return user;
        }
        ),

    getAllRepsForUser: protectedProcedure
        .input(z.object({
            startDate: z.date(),
            endDate: z.date(),
        }))
        .query(async ({ input, ctx }) => {
            //combine pushups and situps
            const currentExcercises = await ctx.prisma.exercises.findMany({
                where: {
                    userId: ctx.auth?.userId,
                    date: {
                        gte: input.startDate,
                        lte: input.endDate,
                    }
                },
                select: {
                    userId: true,
                    pushupsCount: true,
                    situpsCount: true,
                    weightLiftingCount: true,
                    date: true
                },
                orderBy: {
                    date: "asc",
                },
            });



            return { currentExcercises };
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
                    repsAmount: 0,
                    situpsAmount: 0,
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
                refund: z.number().optional(),
            }))
        .mutation(async ({ input, ctx }) => {
            const session = await ctx.prisma.activitiesSession.create({
                data: {
                    userId: input.userId,
                    startDate: input.startDate,
                    endDate: input.endDate,
                    status: input.status === "FULL" ? "FULL" : (input.status === "NONE" ? "NONE" : "PARTIAL"),
                    pledge: input.pledge,
                    refund: input.refund ?? 0,
                }
            })
            return session;
        }
        ),

    paginate: protectedProcedure
        .input(
            z.object({
                userId: z.string(),
                limit: z.number(),
                cursor: z.string().nullish()
            }))
        .query(async ({ input, ctx }) => {
            const allSessionNumber = await ctx.prisma.activitiesSession.count({
                where: {
                    userId: input.userId,
                }
            })
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
            const totalPage = Math.ceil(allSessionNumber / input.limit);
            return {
                session,
                totalPage,
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
                    exercises: {
                        where: {
                            date: {
                                gte: input.startDate,
                                lte: input.endDate,
                            },
                        },
                        select: {
                            pushupsCount: true,
                            situpsCount: true,
                            weightLiftingCount: true,
                        },
                    },
                    repsAmount: true,
                    startDate: true,
                    endDate: true,
                }
            });
            if (!user) throw new Error("User not found")
            if (!user.startDate || !user.endDate) throw new Error("startdate or enddate not found")
            const totalday = daysDifference(user.startDate, user.endDate) + 1;
            //check each day if user did enough reps equal or more than repsAmount
            let success = "NONE"
            let count = 0

            //if no any pushups record, return false
            if (user) {
                if (user.exercises.length === 0 || user.exercises === null) {
                    return {
                        success,
                        count,
                        totalday
                    };
                }
                if (user.exercises === undefined) {
                    success = "UNDEFINED"
                    return {
                        success,
                        count,
                        totalday
                    };
                }
                for (let i = 0; i < user.exercises.length; i++) {
                    if (user.exercises[i]!.pushupsCount! >= user.repsAmount!
                        && user.exercises[i]!.situpsCount! >= user.repsAmount!) {
                        count += 1
                    }
                }

                //if count is not equal to totalday, return false means user is not success
                if (count === 0) {
                    success = "NONE"
                }
                if (count !== totalday && count > 0) {
                    success = "PARTIAL";
                }

                if (count === totalday) {
                    success = "FULL"
                }
            }

            else if (!user) {
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
        
        isTodayYourEndDate: publicProcedure
        .query(async ({ ctx }) => {
            const user = await ctx.prisma.users.findMany({
                select: {
                    userId: true,
                    endDate: true,
                    startDate: true,
                }
        })
        return user;
    })


});

