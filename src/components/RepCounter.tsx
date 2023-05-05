import React, { useState } from "react";
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";

interface RepCounterProps {
  reps?: number;
  userId: string | undefined | null;
}

interface User {
  userId: string;
  count: number;
}

export default function RepCounter(props: RepCounterProps) {
  const [reps, setReps] = useState(0);
  const user = useUser();

  if (props.userId) {
    //get reps for today from db
    const list = api.reps.getUserId.useQuery({ userId: props.userId });
  } else if (props.userId == null || props.userId == undefined) {
    //get reps for today from local state
  }

  return (
    <div className="flex">
      {props.userId ? <p>{props.userId}</p> : <p>{reps}</p>}
    </div>
  );
}
