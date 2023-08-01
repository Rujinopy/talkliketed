import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
} from "~/server/api/trpc";

import { clerkClient } from '@clerk/nextjs/server';

export const profilesRouter = createTRPCRouter({
    getProfile: publicProcedure
        .query(async ({ ctx }) => {
            const userId = ctx.auth?.userId;
            const profile = await clerkClient.users.getUser(userId ?? "");
            return profile
        }),
    
    
})