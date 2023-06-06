import { createNextApiHandler } from "@trpc/server/adapters/next";
import cors from "nextjs-cors"
import { env } from "~/env.mjs";
import { createTRPCContext } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";
import type { NextApiRequest, NextApiResponse } from "next";
// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
          );
        }
      : undefined,
});

// const handler = async (req: NextApiRequest, res: NextApiResponse ) {

// }
