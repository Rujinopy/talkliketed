import { IncomingHttpHeaders } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import { Webhook, WebhookRequiredHeaders } from "svix";
import { buffer } from "micro";
import { env } from '~/env.mjs'
import { appRouter } from "../../../../server/api/root";
import { createTRPCContext } from "../../../../server/api/trpc";
import { isToday } from "date-fns";
// Disable the bodyParser so we can access the raw
// request body for verification.
export const config = {
  api: {
    bodyParser: false,
  },
};

const webhookSecret: string = process.env.WEBHOOK_SECRET || "";

export default async function handler(
  req: NextApiRequestWithSvixRequiredHeaders,
  res: NextApiResponse
) {
  const ctx = await createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);
  // Verify the webhook signature
  // See https://docs.svix.com/receiving/verifying-payloads/how
  const payload = (await buffer(req)).toString();
  const headers = req.headers;
  const wh = new Webhook(webhookSecret);
  let evt: Event | null = null;
  try {
    evt = wh.verify(payload, headers) as Event;
  } catch (_) {
    return res.status(400).json({});
  }

  // Handle the webhook
  const eventType: EventType = evt.type;
  if (eventType === "user.created") {
    const { id }= evt.data;
    caller.reps.createUserByUserId({
      userId: id as string})
  }

  if (eventType === "session.created") {
    const { user_id }= evt.data;
    // const isTodayReps = await caller.reps.getRepsForUser(
    //   { userId: user_id as string, date: new Date() }
    // )
    // const isSubs = await caller.reps.checkIfUserIsMem({
    //   userId: user_id as string
    // })

    // if (!isTodayReps && (isSubs === "SUBS" || isSubs === "MEM") ) {
    //   caller.reps.createRepForUser({
    //     userId: user_id as string,
    //     date: new Date(),
    //     reps: 0
    //   })
    // }
  }
  res.json({});
}

type NextApiRequestWithSvixRequiredHeaders = NextApiRequest & {
  headers: IncomingHttpHeaders & WebhookRequiredHeaders;
};

// Generic (and naive) way for the Clerk event
// payload type.
type Event = {
  data: Record<string, string | number>;
  object: "event";
  type: EventType;
};

type EventType = "user.created" | "user.updated" | "*" | "session.created";