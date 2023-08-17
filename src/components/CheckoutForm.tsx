import React, { useState } from "react";
import CustomDonationInput from "../components/CustomDonationInput";
import getStripe from "~/utils/get-stripejs";
import { fetchPostJSON } from "~/utils/api-helpers";
import { formatAmountForDisplay } from "~/utils/stripe-helpers";
import * as config from "config/config";
import Link from "next/link";
import { api } from "~/utils/api";
import { useStore } from "store/stores";

interface Form {
  Toggle: boolean;
  Id: string;
  RepsPerDay: number;
  SitupsPerDay: number;
}
interface storeProps {
  startDate: Date;
  endDate: Date;
  repsPerDay: number;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  setRepsPerDay: (reps: number) => void;
}

const CheckoutForm = (props: Form) => {
  const startDate = useStore(
    (state: unknown) => (state as storeProps).startDate
  );
  const endDate = useStore((state: unknown) => (state as storeProps).endDate);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({
    customDonation: Math.round(config.MAX_AMOUNT / config.AMOUNT_STEP),
  });

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setInput({
      ...input,
      [e.currentTarget.name]: e.currentTarget.value,
    });

  //handle form submission
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    console.log("handleSubmit");

    //create checkout session
    const response = await fetchPostJSON("/api/trpc/checkout_session", {
      amount: input.customDonation,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      repsAmount: props.RepsPerDay,
      situpsAmount: props.SitupsPerDay,
      userId: props.Id ?? "",
    });

    const stripe = await getStripe();

    if (stripe) {
      if (response.id === undefined || response.id === null) {
        console.warn("response.id is undefined");
        return;
      }
      const { error } = await stripe.redirectToCheckout({
        sessionId: response.id,
      });

      console.warn(error.message);
      if (response) {
        console.log(response);
      }
    }
  };
  //hidden form if props.Toggle is false
  if (!props.Toggle) {
    return null;
  }

  const useMutation = api.reps.updateStartEndDates.useMutation();

  //turn repsPerDay into number
  const updateDatesToDb = () => {
    if (startDate && endDate) {
      useMutation
        .mutateAsync({
          userId: props.Id ?? "",
          startDate: startDate,
          endDate: endDate,
          repsAmount: props.RepsPerDay,
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    <section className="flex max-w-7xl flex-col-reverse md:w-screen md:flex-row md:pt-16">
      <div className="mt-2 w-screen space-y-3 bg-white p-5 shadow-neo md:ml-4 md:w-[50%] md:rounded-xl">
        <h1 className="text-3xl font-bold ">Pledge information</h1>
        <h1 className="border-dashed border-black bg-pink-100 p-3">
          <span className="font-bold">UPDATE</span> We&apos;re planning to
          transition to a no-charge policy soon! However, for the time being,
          the pledge policy will remain exactly as outlined in the article
          below.
        </h1>
        <p className="">
          At the start of your challenge, a charge will be applied. In the event
          that the challenge is successfully completed by its end date, you will
          receive a full or partial refund corresponding to your progress.{" "}
          <span className="font-bold">
            A deduction of 6% will be made to cover Stripe&apos;s fees. (current
            policy)
          </span>
        </p>
        <p className="border border-dashed border-black bg-yellow-100 p-3 text-sm">
          Refund = Initial Pledge - (Missed Days x (Initial Pledge / Total
          Challenge Days)) - (0.06 x Initial Pledge)
        </p>
        <p className="font-bold underline">example</p>
        <p className="">
          <span className="font-bold">Full refund case: </span>Suppose you
          pledge $100 for accomplishing 100 pushups a day over 10 days. After 15
          days, you have consistently completed 100 pushups each day. Your
          refund will amount to $100 - (0 x (100 / 10)) - (0.06 x 100) = $94.
        </p>
        <p className="">
          <span className="font-bold">Partial refund case: </span> Similarly, if
          you pledge $100 for 100 pushups a day over 10 days but only complete
          100 pushups on 12 days out of 15, you will be refunded $100 - (3 x
          (100 / 10)) - (0.06 x 100) = $70. After the deduction of 6%, the
          refund becomes $64.
        </p>
        <p className="font-bold">
          ***If you are not ready to make a pledge at this moment, you have the
          option to choose &ldquo;Go without a pledge.&ldquo; The application will function
          as the pledge version, but without pledge and refund features.***
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-center justify-center py-10 md:w-[50%]"
      >
        <h1 className="text-4xl font-extrabold ">Add pledge</h1>
        <CustomDonationInput
          className="mt-12 w-full rounded-lg border-2 border-black px-2 py-3 font-mono text-2xl text-black focus:border-2 focus:border-[#ffdb58] focus:outline-none"
          name={"customDonation"}
          value={input.customDonation}
          min={config.MIN_AMOUNT}
          max={config.MAX_AMOUNT}
          step={config.AMOUNT_STEP}
          currency={config.CURRENCY}
          onChange={handleInputChange}
        />

        <button
          className="mt-10 w-3/4 rounded-lg border-2 border-black bg-[#fdfd96] px-12 py-2
        font-mono text-2xl shadow-neo hover:cursor-pointer hover:bg-[#ffdb58] md:mt-5 md:w-2/4"
          type="submit"
          disabled={loading}
        >
          Pledge {formatAmountForDisplay(input.customDonation, config.CURRENCY)}
        </button>
        <Link href="/" className="mt-5">
          <button
            onClick={updateDatesToDb}
            className="w-full rounded-lg border-2 border-black bg-[#fdfd96] px-10 py-2 font-mono text-2xl
          shadow-neo hover:cursor-pointer hover:bg-[#ffdb58] md:mt-2 md:w-auto"
          >
            Go without pledge
          </button>
        </Link>
      </form>
    </section>
  );
};

export default CheckoutForm;
