import { useRouter } from "next/router";
import Link from "next/link";
import useSWR from "swr";
import Stripe from "stripe";

const Result = () => {
  const router = useRouter();
  const { data }: { data: undefined | Stripe.Refund } = useSWR<Stripe.Refund>(
    router.query ? `/api/trpc/refund/${(router.query.id as string) ?? ""}` : "",
    (url: string) => fetch(url).then((res) => res.json()).finally()
  );
  console.log(data)
  if (data === undefined) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#a388ee] font-mono text-xl">
        <h1 className="font-bold text-white">loading...</h1>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#a388ee] font-mono text-xl">
      <Link
        href="/"
        className="text-stroke-3 p-5 font-mono text-6xl font-bold text-[#fdfd96]"
      >
        Motiflex
      </Link>
      <div className="flex h-96 w-96 flex-col items-center justify-center rounded-lg border-2 border-black bg-white shadow-lg">
        <h1>
          Refunding status:{" "}
          <span
            className={`inline-block ${
              data.status === "succeeded" ? "text-green-400" : "text-red-400"
            } font-bold`}
          >
            {data.status ?? ""}
          </span>
        </h1>
        <h1 className={`${data.status === "succeeded" ? "" : "hidden"} `}>
          Pledge Amount:{" "}
          <span className="inline-block font-bold">
            {data.metadata?.pledge} USD
          </span>
        </h1>
        <h1 className={`${data.status === "succeeded" ? "" : "hidden"} `}>
          Refunded Amount:{" "}
          <span className="inline-block font-bold text-green-500">
          {(data.amount * 0.94 / 100)} USD
          </span>
        </h1>
        <h1 className="text-sm">
          Includes tax and application processing costs.
        </h1>
        <Link
          href="/user-profile"
          className="mt-5 border-2 border-black p-2 shadow-neo hover:bg-yellow-100"
        >
          Go to your profile
        </Link>
        <h3 className="mt-5 px-5 text-sm">Something went wrong? Send me your problem at Discord, i&apos;ll fix it.</h3>
        <Link href={"https://discord.gg/WTtZu65nKE"} 
        className="mt-5 text-sm  hover:underline border-2 border-black p-3 shadow-neo">
          Go to discord
        </Link>
      </div>
    </div>
  );
};

export default Result;
