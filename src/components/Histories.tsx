import React from "react";

interface ActivitiesSession {
  createdAt: Date | null;
  endDate: Date | null;
  startDate: Date | null;
  id: number | string | null;
  userId: string | null;
  pledge: number | null;
  status: string | null;
}

interface SessionAndId {
  session: ActivitiesSession;
  id: number;
}

export const Histories = (props: SessionAndId) => {
  return (
    <div className="flex h-[10vh] w-full divide-x-2 divide-black border-b-2 border-black bg-[#fdfd96] md:text-2xl">
      <div className="flex w-1/12 items-center justify-center">
        <h1 className="pl-1 text-center font-mono ">-</h1>
      </div>
      <div className="flex w-1/4 items-center">
        <h1 className="pl-1 font-mono text-sm md:text-2xl">
          {props.session.startDate
            ?.toDateString()
            .replaceAll(" ", "/")
            .slice(4)}{" "}
          -{" "}
          {props.session.endDate?.toDateString().replaceAll(" ", "/").slice(4)}
        </h1>
      </div>
      <div className="flex w-1/6 items-center md:w-1/12 ">
        {props.session.status === "FULL" ? (
          <span className="h-full w-full bg-green-500 font-mono text-white"></span>
        ) : (props.session.status === "NONE" ? 
          <span className="h-full w-full bg-red-500"></span> : <span className="h-full w-full bg-yellow-500"></span>
        )}
      </div>
      <div className="w-1/6 md:w-1/12 items-center flex">
        <h1 className="pl-2 font-mono ">{props.session.pledge} <span className="text-sm font-bold">USD</span></h1>
      </div>
      <div className="flex w-1/12 items-center ">
        <h1 className="pl-3 font-mono">push-up</h1>
      </div>
    </div>
  );
};

export default Histories;
