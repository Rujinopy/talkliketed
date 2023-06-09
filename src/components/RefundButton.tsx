import React, { useState } from "react";
import getStripe from "~/utils/get-stripejs";
import { fetchPostJSON } from "~/utils/api-helpers";

interface RefundData {
  endDate: Date;
}

const RefundButton = (props: RefundData) => {
  const [loading, setLoading] = useState(false);
  const today = new Date();

  const handleSubmit = async () => {
    setLoading(true);
    //create checkout session
    const response = await fetchPostJSON("/api/trpc/refund");

    const stripe = await getStripe();

    if (stripe) {
      if (response.id === undefined || response.id === null) {
        console.warn("response.id is undefined");
        return;
      }

      if (response) {
        console.log(response);
      }
    }
  };

  const isUserEnded = async () => {
    if (today > props.endDate || today === props.endDate) {
      await handleSubmit();
      return true;
    }
    alert("you have not ended your subscription yet");
    return false;
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    <div>
      <button
        className="rounded-lg border-2 border-black bg-red-200 px-1 py-1
                  font-mono text-sm duration-200 hover:translate-x-1 hover:cursor-pointer hover:bg-red-400 
                  hover:shadow-neo md:text-lg md:hover:translate-x-3"
        onClick={isUserEnded}
      >
        claim pledge &#128181;
      </button>
    </div>
  );
};

export default RefundButton;
