import React, { useState, type FC } from "react";

import CustomDonationInput from "../components/CustomDonationInput";
import { fetchPostJSON } from '../utils/api-helpers'
import {
  formatAmountForDisplay,
  formatAmountFromStripe,
} from "../utils/stripe-helpers";
import * as config from "../config";

import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import type { PaymentIntent } from "@stripe/stripe-js";
import type { StripeError } from "@stripe/stripe-js";

const ElementsForm: FC<{ paymentIntent?: PaymentIntent | null }> = ({
  paymentIntent = null,
}) => {
  const defaultAmout = paymentIntent
    ? formatAmountFromStripe(paymentIntent.amount, paymentIntent.currency)
    : Math.round(config.MAX_AMOUNT / config.AMOUNT_STEP);

  const [input, setInput] = useState({
    customDonation: defaultAmout,
    cardholderName: "",
  });

  // Track the state of the form submission
  const [paymentType, setPaymentType] = useState("");
  const [payment, setPayment] = useState({ status: "initial" });
  const [errorMessage, setErrorMessage] = useState("");
  const stripe = useStripe();
  const elements = useElements();

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setInput({
      ...input,
      [e.currentTarget.name]: e.currentTarget.value,
    });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
    try {
      e.preventDefault();
      // Abort if form isn't valid
      if (!e.currentTarget.reportValidity()) return;
      if (!elements) return;
      setPayment({ status: "processing" });

      // Create a PaymentIntent with the specified amount.
      const response = await fetchPostJSON('/api/trpc/payment_intents', {
        amount: input.customDonation,
        payment_intent_id: paymentIntent?.id,
      })

      // Use your card Element with other Stripe.js APIs

      const { error } = await stripe!.confirmPayment({
        elements,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: input.cardholderName,
            },
          },
          return_url: `${window.location.origin}/pay-with-elements/result`,
        },
      });

      if (error) {
        setPayment({ status: "error" });
        setErrorMessage(error.message ?? "An unknown error occurred");
      } else if (paymentIntent) {
        setPayment(paymentIntent);
      }
    } catch (err) {
      const { message } = err as StripeError;

      setPayment({ status: "error" });
      setErrorMessage(message ?? "An unknown error occurred");
    }
  };

  return (
    <>
      <form onSubmit={() => void handleSubmit}>
        <CustomDonationInput
          className="focusborder-black mt-5 rounded-lg border-2 px-3 py-3 font-mono text-2xl text-black"
          name="customDonation"
          value={input.customDonation}
          min={config.MIN_AMOUNT}
          max={config.MAX_AMOUNT}
          step={config.AMOUNT_STEP}
          currency={config.CURRENCY}
          onChange={handleInputChange}
        />
        <fieldset className="elements-style">
          <legend className="font-mono">Your payment details:</legend>
          {paymentType === "card" ? (
            <input
              placeholder="Cardholder name"
              className="w-full border-2 p-2 focus:border-black"
              type="Text"
              name="cardholderName"
              onChange={handleInputChange}
              required
            />
          ) : null}
          <div className="FormRow elements-style">
            <PaymentElement
              className="my-3"
              onChange={(e) => {
                setPaymentType(e.value.type);
              }}
            />
          </div>
        </fieldset>
        <button
          className="text-md mt-5 rounded-xl border border-black bg-amber-100 px-3 
          py-3 font-mono text-black duration-150 hover:bg-amber-200 hover:shadow-neo"
          type="submit"
          disabled={
            !["initial", "succeeded", "error"].includes(payment.status) ||
            !stripe
          }
        >
          Confirm Pledge{" "}
          {formatAmountForDisplay(input.customDonation, config.CURRENCY)}
        </button>
      </form>
    </>
  );
};

export default ElementsForm;
