/* eslint-disable @typescript-eslint/no-unused-vars */
import { set } from "date-fns";
import { userAgent } from "next/server";
import React, { useEffect, useState } from "react";
import { api } from "~/utils/api";


interface RepCounterProps {
  reps?: number;
  userId: string | undefined | null;
  date: Date
}

interface User {
  userId: string;
  count: number;
}

export default function RepCounter(props: RepCounterProps) {
  const [reps, setReps] = useState(props.reps);
  useEffect(() => {
    setReps(props.reps);
  }, [props.reps]);

  return (
    <div className="w-auto max-w-xl border-b-1 border-r-1 mx-auto my-5 transform rounded-full border-2 border-black bg-[#fdfd96] px-5 py-2 
    font-medium text-black shadow-lg transition duration-200 font-mono md:text-2xl flex justify-center items-center
     hover:shadow-sm">
       <p className="">Today&apos;s goal: {reps} / 21</p>
    </div>
  );
}
