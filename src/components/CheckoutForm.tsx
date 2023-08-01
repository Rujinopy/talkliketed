import React, { useState } from 'react'
import CustomDonationInput from '../components/CustomDonationInput'
import getStripe from '~/utils/get-stripejs'
import { fetchPostJSON } from '~/utils/api-helpers'
import { formatAmountForDisplay } from '~/utils/stripe-helpers'
import * as config from 'config/config'
import Link from 'next/link'
import { api } from '~/utils/api'
import { useStore } from "store/stores";

interface Form {
  Toggle: boolean
  Id: string
  RepsPerDay: number
}
interface storeProps {
  startDate: Date;
  endDate: Date;
  repsPerDay: number;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  setRepsPerDay: (reps: number) => void;
}

const CheckoutForm = (props: Form) => {
  const startDate = useStore(
    (state: unknown) => (state as storeProps).startDate
  );
  const endDate = useStore((state: unknown) => (state as storeProps).endDate);
    const [loading, setLoading] = useState(false)
    const [input, setInput] = useState({
      customDonation: Math.round(config.MAX_AMOUNT / config.AMOUNT_STEP),
    })
  
  
    const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
      setInput({
        ...input,
        [e.currentTarget.name]: e.currentTarget.value,
      })
    
    //handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault()
      setLoading(true)
      console.log('handleSubmit')

      //create checkout session
      const response = await fetchPostJSON('/api/trpc/checkout_session', {
        amount: input.customDonation,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        repsAmount: props.RepsPerDay,
        userId: props.Id ?? "",
      })

      const stripe = await getStripe()

      if (stripe) {
        if(response.id === undefined || response.id === null) {
          console.warn('response.id is undefined')
          return
        }
        const { error } = await stripe.redirectToCheckout({
          sessionId: response.id,
        })
        
        console.warn(error.message)
        if(response) {
          console.log(response)
        }
      }
      
    }
    //hidden form if props.Toggle is false
    if(!props.Toggle) {
      return null
    }

    const useMutation = api.reps.updateStartEndDates.useMutation();

    //turn repsPerDay into number
    const updateDatesToDb = () => {
      if (startDate && endDate) {
        useMutation.mutateAsync({
          userId: props.Id ?? "",
          startDate: startDate,
          endDate: endDate,
          repsAmount: props.RepsPerDay,
        }).catch((err) => {
          console.error(err);
        });
      }
    };

  return (
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    <section className='flex flex-col md:flex-row md:w-screen max-w-7xl md:pt-16'>
    <div className='w-full md:w-[50%] h-fit bg-white border-2 border-black rounded-xl p-5 space-y-3'>
      <h1 className='text-3xl font-bold '>Pledge information</h1>
      <p className=''>We will charge you at the beginning of your challenge. If the challenge reaches its end date, your payment
      will be refunded in full amount or partial, propotionally to your progress, <span className='font-bold'>with 6% deduction for Stripe fees.</span></p>
      <p className='font-bold underline'>example</p>
      <p className=''>- You pledge $100 for 100 pushups a day for 10 days.
       After 15 days you have done 100 pushups everyday. You will be refunded $100 - (0 x (100 / 10)) - (0.06 x 100) = $94.</p>
      <p className=''>- You pledge $100 for 100 pushups a day for 10 days.
       After 15 days you have done 100 pushups for only 12 days. It means, you missed three days. So, you will be refunded $100 - (3 x (100 / 10))  - (0.06 x 100) = $70 - 6 = $64</p>
       <p className='font-bold'>**If you don&apos;t feel comfortable to make pledge right now, feel free to select &quot;Go without pledge&quot;</p>
       <p className='font-bold'>the app will perform everything like the pledge version but without pledge and refund feature.**</p>
    </div>
    <form onSubmit={handleSubmit} className='flex flex-col w-full md:w-[50%] justify-center items-center py-10'>
      <CustomDonationInput
        className="py-3 px-24 mt-12 font-mono text-2xl text-black border-2 border-black rounded-lg focus:border-2 focus:border-[#ffdb58] focus:outline-none"
        name={'customDonation'}
        value={input.customDonation}
        min={config.MIN_AMOUNT}
        max={config.MAX_AMOUNT}
        step={config.AMOUNT_STEP}
        currency={config.CURRENCY}
        onChange={handleInputChange}
      />

      <button
        className="px-12 mt-10 md:mt-5 py-2 shadow-neo rounded-lg font-mono text-2xl hover:cursor-pointer bg-[#fdfd96] hover:bg-[#ffdb58] border-2 border-black"
        type="submit"
        disabled={loading}
      >
        Pledge {formatAmountForDisplay(input.customDonation, config.CURRENCY)}
      </button>
      <Link href="/" className='mt-5'>
        <button onClick={updateDatesToDb} className="px-10 md:mt-5 py-2 shadow-neo rounded-lg font-mono text-2xl
          hover:cursor-pointer bg-[#fdfd96] hover:bg-[#ffdb58] border-2 border-black">Go without pledge</button>
      </Link>
    </form>
    </section>
  )
}

export default CheckoutForm

