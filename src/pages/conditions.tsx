import React from 'react'
import NavbarWithoutCam from '~/components/NavbarWithoutCam'

function conditions() {
  return (
    <div className=''>
        <NavbarWithoutCam style="md:flex top-0 z-50 bg-yellow-200" />
        <div className='w-screen md:w-[50%] bg-white p-5 space-y-3 mt-5'>
            <h1 className='text-3xl font-bold '>Motiflex</h1>
            <p className=''>An app that forces you to workout by get your money as pledge for raising motivation. 
                <span className='font-bold'> we use computer vision AI to track and count your poses, powered by Tensorflow</span></p>
                <p>Now we only have push-ups counter :D.</p>
        </div>
        <div className='w-screen md:w-[50%] bg-white p-5 space-y-3 mt-5'>
            <h1 className='text-3xl font-bold '>Pledge information</h1>
            <p className=''>We will charge you at the beginning of your challenge. If the challenge reaches its end date, your payment
            will be refunded in full amount or partial, propotionally to your progress, <span className='font-bold'>with 6% deduction for Stripe&apos;s fees.</span></p>
            <p className='font-bold underline'>example</p>
            <p className=''>- You pledge $100 for 100 pushups a day for 10 days.
            After 15 days you have done 100 pushups everyday. You will be refunded $100 - (0 x (100 / 10)) - (0.06 x 100) = $94.</p>
            <p className=''>- You pledge $100 for 100 pushups a day for 10 days.
            After 15 days you have done 100 pushups for only 12 days. It means, you missed three days. So, you will be refunded $100 - (3 x (100 / 10))  - (0.06 x 100) = $70 - 6 = $64</p>
            <p className='font-bold'>**If you don&apos;t feel comfortable to make pledge right now, feel free to select &quot;Go without pledge&quot;</p>
            <p className='font-bold'>the app will perform everything like the pledge version but with no pledge and refund features.**</p>
        </div>
        <div>

        </div>
    </div>
  )
}

export default conditions