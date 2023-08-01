/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { api } from "~/utils/api";

interface RepCounterProps {
  reps?: number;
  userId: string | undefined | null;
  date: Date
  goal: number
  isSignedIn: boolean
}

export default function RepCounter(props: RepCounterProps) {
  const checkIfUserIsSubsOrMem = api.reps.checkIfUserExists.useQuery({
    userId: props.userId ?? "",
  }, {
    enabled: props.isSignedIn === true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  const SubsOrMem = checkIfUserIsSubsOrMem.data?.Role

  const [reps, setReps] = useState(props.reps);
  useEffect(() => {
    setReps(props.reps);
  }, [props.reps]);

  return (
    <div className=" h-[10%] md:h-auto relative transform md:border-y-2 border-b-2 md:border-b-2 md:border-t-0 border-black bg-[#fdfd96] px-5 py-2 
     text-black shadow-lg transition duration-200 font-mono flex justify-center items-center
     hover:shadow-sm">
       <p className="text-4xl md:text-4xl">{reps} / {(SubsOrMem === "MEM" || SubsOrMem === "SUBS") ? props.goal : 21}</p>
    </div>
  );
}
