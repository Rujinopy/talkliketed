import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { api } from '../utils/api'
import Link from 'next/link'
import useSWR from 'swr'
import { useEffect } from 'react'

type ChangeRoleToSubsArgs = {
    userId: string;
    pledge: number;
    payment_intent: string;
  }
type PaymentData = {
    metadata: {
      userId: string;
    };
    payment_intent: {
      amount: number;
      id: string;
    }
  }

const Result: NextPage = () => {

        const router = useRouter()
       
        const { data }: {data?: PaymentData | undefined} = useSWR(
          router.query.session_id
            ? `/api/trpc/checkout_session/${router.query.session_id.toString() ?? ""}`
            : "", (url: string) => fetch(url).then((res) => res.json())
        )
        
        const changeRoleToSubs = api.reps.changeUserToSubs.useMutation<ChangeRoleToSubsArgs>()

        //after fetch data, update the database
        useEffect (() => {
            if (data) {

                changeRoleToSubs.mutate({
                    userId: data.metadata.userId,
                    pledge: data.payment_intent.amount / 100,
                    payment_intent: data.payment_intent.id
                })
            }
        }, [data, changeRoleToSubs.mutate])

        
    return (
        <div className='bg-[#a388ee] h-screen flex flex-col items-center justify-center'>
            <h1 className='text-2xl'>Result</h1>
            <p className='text-4xl mx-auto text-white font-mono'>Payment Completed!</p>
            <Link href="/user-profile" 
            className='bg-white rounded-3xl border-2 border-black text-3xl py-2 px-4 mt-5 
            hover:shadow-neo hover:-translate-y-2 hover:-translate-x-2 transition hover:shadow-[#fdfd96]'>
                <button>See result</button></Link>
        </div>
    )
}

export default Result