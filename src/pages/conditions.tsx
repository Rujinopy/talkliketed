import React from "react";
import NavbarWithoutCam from "~/components/NavbarWithoutCam";
import PaymentInformation from "~/components/PaymentInformation"
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
      <PaymentInformation />
    </div>
  );
}

export default conditions;
