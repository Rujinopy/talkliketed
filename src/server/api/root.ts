import { createTRPCRouter } from "~/server/api/trpc";
// import { exampleRouter } from "~/server/api/routers/example";
import { postsRouter } from "./routers/posts";
import { repsRouter } from "./routers/reps";
import { profilesRouter } from "./routers/profiles";


/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  posts: postsRouter,
  reps: repsRouter,
  profiles: profilesRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
