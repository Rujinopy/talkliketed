import React from "react";

export default function Paymentinformation() {
  const [sectionVisible, setSectionVisible] = React.useState(false);

  const toggleSection = () => {
    setSectionVisible(!sectionVisible);
  };
  return (
    <div className="mt-2 w-full space-y-3 bg-white p-5 md:ml-4 md:w-[50%]">
      <h1 className="text-3xl font-bold ">Pledge information</h1>
      <h1 className="border-dashed border-black bg-pink-100 p-3">
        <span className="font-bold">UPDATE</span> We&apos;re planning to
        transition to a no-charge policy soon! However, for the time being, the
        pledge policy will remain exactly as outlined in the article below.
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
      <p className="px-20 text-center font-bold">
        You have to reach all exercise goals that greater than zero to get
        counted in each day.
      </p>
      <button onClick={toggleSection}
 className="font-bold underline hover:text-pink-400 ">
        example click
      </button>
      {sectionVisible && 
      <section className="">
        <p className="">
          <span className="font-bold">Full refund case: </span>Suppose you
          pledge $100 for accomplishing 100 pushups a day over 10 days. After 10
          days, you have consistently completed 100 pushups each day. Your
          refund will amount to $100 - (0 x (100 / 10)) - (0.06 x 100) = $94.
        </p>
        <p>
          <span className="font-bold">Partial refund case: </span> Similarly, if
          you pledge $100 for 100 pushups a day over 10 days but only complete
          100 pushups on 7 days out of 10, you will be refunded $100 - (3 x (100
          / 10)) - (0.06 x 100) = $70. After the deduction of 6%, the refund
          becomes $64.
        </p>
        <p>
          <span className="font-bold">No refund case: </span>If you commit to a
          $100 pledge for completing 100 pushups per day over a span of 10 days,
          but end up achieving 80 pushups daily instead—consistently or
          intermittently—please note that a refund will not be issued.
        </p>
      </section>}
      <p className="font-bold text-sm">
          ***If you are not ready to make a pledge at this moment, you have the
          option to choose &quot;Go without a pledge.&quot; The application will
          function as the pledge version, but without pledge and refund
          features.***
        </p>
        <h1 className="border-dashed border-black bg-pink-100 p-3">
        <span className="font-bold">At end date, when you have finished your challenge</span> at <a href="/user-profile" className="hover:underline font-bold">user-profile</a>
        {" "}by clicking the button <span className="rounded-lg border-2 border-black bg-red-200 px-1 py-1
                  font-mono text-sm duration-200 hover:translate-x-1 hover:cursor-pointer hover:bg-red-400 
                  "> end challenge/ refund&#128181; </span>
      </h1>
    </div>
  );
}
