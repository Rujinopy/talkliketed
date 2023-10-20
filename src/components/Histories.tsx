import React from "react";

interface ActivitiesSession {
  createdAt: Date | null;
  endDate: Date | null;
  startDate: Date | null;
  id: number | string | null;
  userId: string | null;
  pledge: number | null;
  status: string | null;
  refund: number | null;
}

interface SessionAndId {
  session: ActivitiesSession;
  id: number;
}

export const Histories = (props: SessionAndId) => {
  return (
    <div className="flex justify-between h-[10vh] w-full border-b-2 border-black md:text-2xl font-mono">
      <div className="flex w-1/4 items-center">
        <h1 className="pl-1 font-mono text-sm md:text-md lg:text-lg">
          {props.session.startDate!.toISOString().slice(0, 10)}
          {" "}➡️{" "}
          {props.session.endDate!.toISOString().slice(0, 10)}
        </h1>
      </div>
      <div className="w-1/4 md:w-1/5 items-center flex">
        <h1 className="pl-2 font-mono ">{props.session.pledge} <span className="text-sm font-bold">USD</span></h1>
      </div>
      <div className="w-1/4 md:w-1/5 items-center flex">
        <h1 className="pl-2 font-mono ">{props.session.refund} <span className="text-sm font-bold">USD</span></h1>
      </div>
      <div className="flex w-1/4 items-center justify-center md:w-1/5 text-xs md:text-sm">
        {props.session.status === "FULL" ? (
          <span className="mx-2 py-2 px-1 md:px-5 rounded-xl bg-green-400 font-mono">Full refund</span>
        ) : (props.session.status === "NONE" ? 
          <span className="mx-2 py-2 px-2 md:px-7 rounded-xl bg-red-400">No refund</span> : <span className="md:mx-2 mx-1 py-2 px-4 md:px-8 rounded-xl bg-yellow-300 text-center">Partial</span>
        )}
      </div>
    </div>
  );
};

export default Histories;