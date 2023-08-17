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
    <div className="flex h-[10vh] w-full divide-x-2 divide-black border-b-2 border-black bg-[#fdfd96] md:text-2xl">
      <div className="flex w-1/4 items-center">
        <h1 className="pl-1 font-mono text-sm md:text-2xl">
          {props.session.startDate!.toISOString().slice(0, 10)}
          {" "}|{" "}
          {props.session.endDate!.toISOString().slice(0, 10)}
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
      <div className="w-1/6 md:w-1/12 items-center flex">
        <h1 className="pl-2 font-mono ">{props.session.refund} <span className="text-sm font-bold">USD</span></h1>
      </div>
      <div className="flex w-1/12 items-center ">
        <h1 className="pl-3 font-mono">push-up</h1>
      </div>
    </div>
  );
};

export default Histories;


// const convertDateFormat = (dateString: string) => {
//   const months = {
//     Jan: '01',
//     Feb: '02',
//     Mar: '03',
//     Apr: '04',
//     May: '05',
//     Jun: '06',
//     Jul: '07',
//     Aug: '08',
//     Sep: '09',
//     Oct: '10',
//     Nov: '11',
//     Dec: '12',
//   };

//   const parts = dateString.split(' ');
//   const year = parts[3];
//   const month = months[parts[1] as keyof typeof months];
//   const day = parts[2];

//   return `${day}/${month}`;
// };