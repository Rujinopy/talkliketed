import React from "react";
import NavbarWithoutCam from "~/components/NavbarWithoutCam";

function conditions() {
  return (
    <div className="">
      <NavbarWithoutCam style="md:flex top-0 z-50 bg-yellow-200" />
      <div className="mt-5 w-screen space-y-3 bg-white p-5 pb-0 md:ml-4 md:w-[50%]">
        <h1 className="text-3xl font-bold ">Motiflex</h1>
        <p className="">
          Motiflex is an app designed to boost your motivation by using your
          money as a pledge, ensuring you stick to your workout routine. We
          employ computer vision AI, powered by Tensorflow, to monitor and count
          your exercises.
        </p>
        <p>
        Currently, we offer three exciting challenges:
          push-ups, sit-ups, and weight lifting. 😄
        </p>
      </div>
      <div className="mt-2 w-screen space-y-3 bg-white p-5 md:ml-4 md:w-[50%]">
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
        <p>**You have to reach both exercises goal to get counted in each day.</p>
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
          option to choose &quot;Go without a pledge.&quot; The application will function
          as the pledge version, but without pledge and refund features.***
        </p>
      </div>
      <div></div>
    </div>
  );
}

export default conditions;
