/* eslint-disable @typescript-eslint/no-unused-vars */
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
    <div className="w-full h-20 md:h-auto relative transform border-y-2 md:border-b-2 md:border-t-0 border-black bg-[#fdfd96] px-5 py-2 
    font-medium text-black shadow-lg transition duration-200 font-mono text-2xl md:text-3xl flex justify-center items-center
     hover:shadow-sm">
       <p className="">Today&apos;s goal: {reps} / 21</p>
    </div>
  );
}
