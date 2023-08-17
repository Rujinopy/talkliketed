import Link from "next/link";

export default function Subscription() {
    return (
        <Link className="border-r-2 my-5 transform  border-black px-5 py-1 font-mono 
        text-xl font-medium text-black transition duration-200 hover:-translate-x-1 hover:-translate-y-1 h-full
         hover:bg-[#bafca2] flex items-center hover:shadow-neo absolute md:relative invisible md:visible" href="/challenge">
            Set Custom Goal
        </Link>
    )
}