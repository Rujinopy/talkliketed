//
interface LayoutProps {
    children: React.ReactNode
}
import React, { Children } from 'react'

export default function PaymentLayout({children}: LayoutProps) {
  return (
    <div className='bg-[#ffb2ef] flex flex-col md:flex-row w-screen md:px-10 py-10 space-y-8 md:space-y-0'>
        {children}
    </div>
  )
}
