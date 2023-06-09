import React, { useState } from 'react'
import CustomDonationInput from '../components/CustomDonationInput'
import getStripe from '~/utils/get-stripejs'
import { fetchPostJSON } from '~/utils/api-helpers'
import { formatAmountForDisplay } from '~/utils/stripe-helpers'
import * as config from 'config/config'
import Link from 'next/link'
import { api } from '~/utils/api'


interface Form {
  Toggle: boolean
}


const CheckoutForm = (props: Form) => {
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

      //create checkout session
      const response = await fetchPostJSON('/api/trpc/checkout_session', {
        amount: input.customDonation,
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
    const mutateToMem = api.reps.changeUserToMem.useMutation();
    const addMem = async () => {
      
      mutateToMem.mutateAsync();
    }

  return (
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    <form onSubmit={handleSubmit} className='flex flex-col w-full justify-center items-center py-10'>
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
      <Link href="/">
        <button onClick={addMem} className="px-12 mt-10 md:mt-5 py-2 shadow-neo rounded-lg font-mono text-2xl
          hover:cursor-pointer bg-[#fdfd96] hover:bg-[#ffdb58] border-2 border-black">Go without pledge</button>
      </Link>
    </form>
  )
}

export default CheckoutForm

