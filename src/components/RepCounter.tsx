/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { api } from "~/utils/api";

interface RepCounterProps {
  reps?: number;
  userId: string | undefined | null;
  date: Date;
  goal: number;
  role: string;
  isSignedIn: boolean;
}

export default function RepCounter(props: RepCounterProps) {
  const [reps, setReps] = useState(props.reps);
  useEffect(() => {
    setReps(props.reps);
  }, [props.reps]);

  return (
    <div
      className=" relative flex h-[10%] transform items-center justify-center border-b-2 border-black bg-[#fdfd96] px-5 py-2 font-mono 
     text-black shadow-lg transition duration-200 hover:shadow-sm md:h-auto md:border-y-2 md:border-b-2
     md:border-t-0"
    >
      <p className="text-4xl md:text-4xl">
        {reps} /{" "}
        {props.role === "MEM" || props.role === "SUBS" ? props.goal : 21}
      </p>
    </div>
  );
}
