import { loadStripe } from '@stripe/stripe-js'
import type { Stripe } from '@stripe/stripe-js'


let stripePromise: Promise<Stripe | null>
const getStripe = () => {
  stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string)
  return stripePromise
}

export default getStripe