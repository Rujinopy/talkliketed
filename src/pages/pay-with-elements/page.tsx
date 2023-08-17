import type { Metadata, NextPage } from "next";
import ElementsForm from "~/components/ElementsForm";
import { useState, useEffect } from "react";
import { PaymentIntent } from "@stripe/stripe-js";
import * as config from "../../config";
import { fetchPaymentIntent } from "../../utils/api-helpers";
import { Elements } from "@stripe/react-stripe-js";
import getStripe from "../../utils/get-stripejs";
import PaymentLayout from "~/components/PaymentLayout";
import NavbarWithoutCam from "~/components/NavbarWithoutCam";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import LoginButton from "~/components/Loginbutton";
export const metadata: Metadata = {
  title: "Donate with Elements",
};

export default function PaymentElementPage() {
  // const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(
  //   null
  // );
  // useEffect(() => {
  //   fetchPaymentIntent("/api/trpc/payment_intents", {
  //     amount: Math.round(config.MAX_AMOUNT / config.AMOUNT_STEP),
  //   }).then((data) => {
  //     setPaymentIntent(data);
  //     console.log(data);
  //   });
  // }, [setPaymentIntent]);
  return (
    <div className="border-b-2 border-black">
      <NavbarWithoutCam />
      <SignedIn>
        <PaymentLayout>
          <section className="min-h-[70vh] w-full px-2 md:w-1/2 md:px-10">
            <div className="rounded-xl bg-white p-8 font-mono text-md shadow-neo">
              <h1 className="text-2xl font-bold">Payment Detail</h1>
              <p className="mt-5">
                <span className="font-bold">
                  We won&apos;t charge you at this time.
                </span>{" "}
                However, if your challenge is not successfully completed by its
                end date, you will be charged the full amount.
              </p>
              <p className="mt-5">
                In the event that your challenge concludes without any days
                marked as failed, your payment allocation will be automatically
                canceled, resulting in no charges incurred.
              </p>
              <p className="mt-5">
                You can monitor both your payment status and your challenge's
                progress on your profile page.
              </p>
            </div>
          </section>
          <section className="min-h-[70vh] w-full rounded-xl bg-white px-10 py-2 pb-10 shadow-neo md:w-1/2">
            <h1 className="bg-white px-2 py-5 font-mono text-3xl">
              Add payment method
            </h1>
            {/* {paymentIntent && paymentIntent.client_secret ? (
              <Elements
                stripe={getStripe()}
                options={{
                  appearance: {
                    variables: {
                      colorIcon: "#6772e5",
                      fontFamily:
                        "monospace, Roboto, Open Sans, Segoe UI, sans-serif",
                    },
                  },
                  clientSecret: paymentIntent.client_secret,
                }}
              > */}
                <ElementsForm />
              {/* </Elements>s
            ) : (
              <p>Loading...</p>
            )} */}
          </section>
        </PaymentLayout>
      </SignedIn>
      <SignedOut>
        <div className="flex h-screen flex-col items-center justify-center">
          <p className="py-5 font-mono text-3xl">
            You need to sign in! &#128512;
          </p>
          <Link href={"/sign-in"}>
            <LoginButton label="Sign in" />
          </Link>
        </div>
      </SignedOut>
    </div>
  );
}