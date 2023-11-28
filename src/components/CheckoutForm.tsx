import React, { useState } from "react";
import CustomDonationInput from "../components/CustomDonationInput";
import getStripe from "~/utils/get-stripejs";
import { fetchPostJSON } from "~/utils/api-helpers";
import { formatAmountForDisplay } from "~/utils/stripe-helpers";
import * as config from "config/config";
import Link from "next/link";
import { api } from "~/utils/api";
import { useStore } from "store/stores";
import Paymentinformation from "./PaymentInformation";
import { Button } from "./Button";

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
      <Paymentinformation />
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
        <Button type="submit" disabled={loading} className="mt-5">Pledge {formatAmountForDisplay(input.customDonation, config.CURRENCY)}</Button>
        <Link href="/challenge" className="mt-5">
          <Button onClick={updateDatesToDb} className="w-full md:mt-2 md:w-auto">
            Go without pledge
          </Button>
        </Link>
      </form>
    </section>
  );
};

export default CheckoutForm;
