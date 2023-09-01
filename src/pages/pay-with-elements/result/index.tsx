import type { NextPage } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import { api } from "~/utils/api";
import { formatAmountForDisplay } from "~/utils/stripe-helpers";
import PrintObject from "~/components/PrintObject";
import { use, useEffect } from "react";
const Result: NextPage = () => {

  const router = useRouter();
  const { data } = api.posts.stripeRetrieve.useQuery({
    payment_intent_id: router.query.payment_intent as string ?? "" ,
  }, {
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    enabled: true,
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.log(error);
    }
  });
  

  if (!data) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#a388ee]">
      <h1 className="text-2xl">Result</h1>
      <p className="mx-auto font-mono text-4xl text-white">
        Loading...
      </p>
    </div>
  )


  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#a388ee]">
      <div className="bg-white rounded-3xl border-black border-2 px-4 py-8 mx-auto w-[60vw] ">
        <h1 className="text-4xl mb-5 text-center font-bold">Result</h1>
        <p className="mx-auto font-mono text-xl text-center text-green-500 font-bold">
          Challenge successfully created !
        </p>
        {/* <p className="mx-auto font-mono text-xl text-black"></p> */}
        <p className="mx-auto font-mono text-xl text-center">
         pledge: {formatAmountForDisplay(data.amount / 100, data?.currency)}
        </p>
      </div>
      <Link
        href="/user-profile"
        className="mt-5 rounded-3xl border-2 border-black bg-white px-4 py-2 text-3xl 
            transition hover:-translate-x-2 hover:-translate-y-2 hover:shadow-neo hover:shadow-[#fdfd96]"
      >
        <button>See result</button>

      </Link>
    </div>
  );
};

export default Result;
