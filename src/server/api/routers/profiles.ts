import { z } from "zod";

import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
} from "~/server/api/trpc";

import { clerkClient } from '@clerk/nextjs/server';

export const profilesRouter = createTRPCRouter({
    getProfile: publicProcedure
        // .input(
        //     z.object({
        //         firstname: z.string(),
        //     })
        // )
        .query(async ({ input, ctx }) => {
            const userId = ctx.auth?.userId;
            const profile = await clerkClient.users.getUser(userId ?? "");
            return profile
        }),
    
    
})