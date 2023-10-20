import React from 'react'
import Link from 'next/link'
export default function Navbutton({title, href}: {title: string, href: string}) {
    return (
        <Link
            className="my-5 flex text-center h-full transform items-center border-black md:px-5 py-1 
            font-mono text-sm md:w-auto px-2 md:text-xl font-medium text-black 
            transition duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:bg-red-300
            hover:shadow-neo md:visible md:relative"
            href={href}
        >
            {title}
        </Link>
    )
}
