import type { NextPage } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import useSWR from "swr";
// import { useStore } from "store/stores";

type PaymentData = {
  metadata: {
    userId: string;
  };
  payment_intent: {
    amount: number;
    id: string;
  };
};
interface storeProps {
  startDate: Date;
  endDate: Date;
  repsPerDay: number;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  setRepsPerDay: (reps: number) => void;
}

const Result: NextPage = () => {
  // const startDate = useStore(
  //   (state: unknown) => (state as storeProps).startDate
  // );
  // const endDate = useStore((state: unknown) => (state as storeProps).endDate);
  const router = useRouter();

  const { data }: { data?: PaymentData | undefined } = useSWR<PaymentData>(
    router.query.session_id
      ? `/api/trpc/checkout_session/${router.query.session_id.toString() ?? ""}`
      : "",
    (url: string) => fetch(url).then((res) => res.json())
  );

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#a388ee]">
      <h1 className="text-2xl">Result</h1>
      <p className="mx-auto font-mono text-4xl text-white">
        Payment Completed!
      </p>
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
