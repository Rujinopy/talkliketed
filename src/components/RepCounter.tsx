/* eslint-disable @typescript-eslint/no-unused-vars */
import { set } from "date-fns";
import React, { useEffect, useState } from "react";
import { api } from "~/utils/api";


interface RepCounterProps {
  reps?: number;
  userId: string | undefined | null;
}

interface User {
  userId: string;
  count: number;
}

//today's date in YYYY-MM-DD format
// const today = new Date().toISOString().slice(0, 10);
// console.log(today);

export default function RepCounter(props: RepCounterProps) {
  const [reps, setReps] = useState(props.reps);
  
  useEffect(() => {
    if (props.userId === undefined || props.userId === null) {
      setReps(0);
    }
  }, []);

  return (
    <div className="w-auto max-w-xl border-b-1 border-r-1 mx-auto my-5 transform rounded-full border-2 border-black bg-[#fdfd96] px-5 py-2 
    font-medium text-black shadow-lg transition duration-200 font-mono md:text-2xl flex justify-center items-center
     hover:shadow-sm">
       <p className="">Today&apos;s goal: {reps} / 21</p>
    </div>
  );
}
