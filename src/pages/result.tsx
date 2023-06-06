import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { api } from '../utils/api'
import { fetchGetJSON } from '../utils/api-helpers'
import Link from 'next/link'
import useSWR from 'swr'
import { useEffect } from 'react'
import { useUser } from "@clerk/nextjs";
const Result: NextPage = () => {
    // const { isLoaded, isSignedIn, user } = useUser()
        const router = useRouter()
      
        // Fetch CheckoutSession from static page via
        // https://nextjs.org/docs/basic-features/data-fetching#static-generation
        const { data, error } = useSWR(
          router.query.session_id
            ? `/api/trpc/checkout_session/${router.query.session_id}`
            : null, (url) => fetch(url).then((res) => res.json())
        )

        const changeRoleToSubs = api.reps.changeUserToSubs.useMutation()
        console.log(data)

        //after fetch data, update the database
        useEffect (() => {
            // if(isSignedIn){
            if (data) {
                console.log(data)
                changeRoleToSubs.mutate({
                    userId: data.metadata.userId,
                    pledge: data.payment_intent.amount / 100,
                    payment_intent: data.payment_intent.id
                })
            }
        // }
        }, [data])

        
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