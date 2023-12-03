import type { RequestHandler } from 'micro'
import { buffer } from 'micro'
import Cors from 'micro-cors'
import type { NextApiRequest, NextApiResponse } from 'next'
import { env } from '~/env.mjs'
import Stripe from 'stripe'
import { appRouter } from "../../../../server/api/root";
import { createTRPCContext } from "../../../../server/api/trpc";


const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: '2022-11-15',
})

// Stripe requires the raw body to construct the event.
export const config = {
  api: {
    bodyParser: false,
  },
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const cors = Cors({
  allowMethods: ['POST', 'HEAD'],
});

const webhookHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const ctx = createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);

  if (req.method === 'POST') {
    const buf = await buffer(req)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const sig = req.headers['stripe-signature']!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(buf, sig, env.STRIPE_WEBHOOK_SECRET)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      // On error, log and return the error message.
      if (err instanceof Error) console.log(err)
      console.log(`❌ Error message: ${errorMessage}`)
      res.status(400).send(`Webhook Error: ${errorMessage}`)
      return
    }
    
    // Successfully constructed event.
    console.log('✅ Success:', event.id)

    // Cast event data to Stripe object.
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
 
      console.log(`💰 PaymentIntent status: ${paymentIntent.status}`)
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
        `❌ Payment failed: ${paymentIntent.last_payment_error?.message ?? 'unknown error'}`
      
    } else if (event.type === 'charge.succeeded') {
      const charge = event.data.object as Stripe.Charge
      const intent = await stripe.paymentIntents.retrieve(charge.payment_intent as string)
      // const paymentIntent = event.data.object as Stripe.PaymentIntent
      // await caller.reps.changeUserToSubs({
      //   userId: paymentIntent.metadata.userId ?? "",
      //   startDate: new Date(paymentIntent.metadata.startDate ?? ""),
      //   endDate: new Date(paymentIntent.metadata.endDate ?? ""),
      //   pledge: paymentIntent.metadata.pledge!,
      //   repsAmount: paymentIntent.metadata.repsAmount ?? "0",
      //   situpsAmount: paymentIntent.metadata.situpsAmount ?? "0",
      //   payment_intent: charge.payment_intent as string
      // })
      console.log(intent)
      console.log(`💵 Charge id: ${charge.id}`)
    }
    else if (event.type === 'charge.refunded') {
      const refund = event.data.object as Stripe.Charge
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await caller.reps.changeSubsToUser({userId: paymentIntent.metadata.userId ?? ""})
      await caller.reps.addSessionHistory({
        userId: paymentIntent.metadata.userId ?? "",
        startDate: new Date(paymentIntent.metadata.startDate ?? ""),
        endDate: new Date(paymentIntent.metadata.endDate ?? ""),
        status: paymentIntent.metadata.status === "FULL" ? "FULL" : "PARTIAL",
        pledge: parseInt(paymentIntent.metadata.pledge ?? "0") ,
        refund: Math.round(refund.amount_refunded),
      })
    }
    else {
      console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`)
    }

    // Return a response to acknowledge receipt of the event.
    res.json({ received: true })
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}


export default cors(webhookHandler as RequestHandler)