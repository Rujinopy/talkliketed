import { useRouter } from "next/router";
import Link from "next/link";
import useSWR from "swr";
import Stripe from "stripe";

const Result = () => {
  const router = useRouter();
  const { data } : {data: undefined | Stripe.Refund}= useSWR<Stripe.Refund>(
    router.query
      ? `/api/trpc/refund/${router.query.id as string ?? ""}`
      : "",
    (url: string) => fetch(url).then((res) => res.json())
  );

  if (data === undefined) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#a388ee] font-mono text-xl">
        <h1 className="text-white font-bold">loading...</h1>
        </div>
    )}
  
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#a388ee] font-mono text-xl">
       <Link href="/" className="font-mono text-6xl p-5 font-bold text-stroke-3 text-[#fdfd96]">Motiflex</Link>
      <div className="flex flex-col items-center justify-center bg-white border-2 border-black rounded-lg shadow-lg w-96 h-96">
        <h1>Refunding status: <span className={`inline-block ${ data.status === "succeeded" ? "text-green-400" : "text-red-400"} font-bold`}>{data.status ?? ""}</span></h1>
        <h1 className={`${ data.status === "succeeded" ? "" : "hidden"} `}>Amount: <span className="inline-block text-green-400 font-bold">{data.amount / 100} USD</span></h1>
        <h1 className="text-sm">Includes tax and application processing costs.</h1>
        <Link href="/user-profile" className="border-2 border-black p-2 mt-5 shadow-neo hover:bg-yellow-100">
          Go to your profile
        </Link>
        <Link href={""} className="mt-5 text-sm  hover:underline">Something went wrong?</Link>
      </div>
    </div>
  );
};

export default Result;