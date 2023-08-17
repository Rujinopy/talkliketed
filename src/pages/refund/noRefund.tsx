import Link from "next/link"


const noRefund = () => {

    return (
        <div className="w-screen h-screen flex flex-col bg-[#fcdfff] justify-center items-center ">
            <Link href="/" className="font-mono text-6xl p-5 font-bold text-stroke-3 text-[#fdfd96]">Motiflex &#128546;</Link>
            <h1 className="text-center text-2xl font-mono max-w-xl">We&apos;re sorry to hear that you haven&apos;t finish any session 
            so you can&apos;t claim back your pledge at full amount.</h1>
            <p className="mt-5">Your session have been reset.</p>
            <div className="flex md:flex-row flex-col md:space-x-5 justify-center items-center">
                <Link href={"/challenge"}>
                    <button className="mt-5 bg-white border-black border-2 px-5 py-2 rounded-md shadow-neo hover:bg-[#fdfd96]">Go back to subscription</button>
                </Link>
                <Link href={"/"}>
                    <button className="mt-5 bg-white border-black border-2 px-10 py-2 rounded-md shadow-neo hover:bg-[#fdfd96]">home</button>
                </Link>
            </div>
        </div>
    )
}

export default noRefund