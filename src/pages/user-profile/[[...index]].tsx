import { api } from "~/utils/api";
import type { NextPage } from "next";
import MenuBar from "~/components/MenuBar";
import NavbarWithoutCam from "~/components/NavbarWithoutCam";
import Title from "~/components/Title";
import { useEffect, useMemo } from "react";
import RefundButton from "~/components/RefundButton";

const UserProfile: NextPage<{ firstname: string }> = ({ firstname }) => {
  const { data } = api.profiles.getProfile.useQuery();
  const progress = api.reps.getAllRepsForUser.useQuery();
  const sessionData = api.reps.checkIfUserExists.useQuery({
    userId: data?.id ?? "",
  });

  const role = useMemo(() => sessionData.data?.Role, [sessionData.data?.Role]);
  const endDate = useMemo(() => sessionData.data?.endDate, [
    sessionData.data?.endDate,
  ]);
  

  return (
    <div className="relative w-screen">
      <NavbarWithoutCam />
      <Title title={"Dashboard"} />
      <MenuBar />
      <div className="flex h-[35vh] md:h-[25vh] flex-col items-center justify-center border-b-2 border-black bg-[#ffb2ef] md:flex-row md:justify-start md:px-44">
        <img
          className="mt-10 h-24 w-24 rounded-full border-2 border-black md:mr-10 md:mt-0"
          src={data?.profileImageUrl}
          alt=""
        />
        <div className="">
          <h1 className="text-stroke-3 text-[3rem] font-semibold text-[#fdfd96] dark:text-white md:text-[3rem]">
            {data?.firstName}
          </h1>
          {role === "SUBS" ? (
          <div className="flex space-x-3">
            {/* <p className="font-mono px-3 py-2 ">status : </p> */}
            <h2 className="font-mono px-3 py-2 rounded-lg bg-white border-2 border-black h-10 tex-center">promised</h2>
              <h2 className="font-mono px-3 py-2 rounded-lg bg-white border-2 border-black h-10 tex-center">pledged</h2>
          </div>
          ) : null}
        </div>
      </div>
      <div className="flex w-screen flex-col border-b-2 border-black bg-[#87ceeb] md:h-[75vh] md:flex-row">
        <div
          aria-label="promises"
          className="mx-auto w-full border-r-2 border-black md:w-1/2"
        >
          <h1 className="mx-auto py-3 text-center font-mono text-4xl font-bold">
            Promises
          </h1>
          <div className="flex h-[60vh] items-center justify-center text-left text-sm text-gray-500 dark:text-gray-400 md:mx-auto md:max-w-5xl">
            <div className="flex md:rounded-3xl bg-white md:shadow-neo ">
              <div
                aria-label="titles"
                className="flex w-3/12 flex-col font-mono text-2xl uppercase text-black md:text-xl"
              >
                <div className="flex h-[15vh] items-center justify-center border border-l-2 border-t-2 border-black md:rounded-tl-3xl">
                  <h1 className="p-5 text-center">Start</h1>
                </div>
                <div className="flex h-[15vh] items-center justify-center border border-l-2 border-black">
                  <h1 className="p-5">End</h1>
                </div>
                <div className="flex h-[15vh] items-center justify-center border border-l-2 border-black">
                  <h1 className="p-5">Pledge</h1>
                </div>
                <div className="flex h-[15vh] items-center justify-center border border-b-2 border-l-2 border-black md:rounded-bl-3xl">
                  <h1 className="p-5">Reps per day</h1>
                </div>
              </div>
              <div
                aria-label="content"
                className=" flex w-9/12 flex-col font-mono text-2xl uppercase text-black"
              >
                <div className="flex h-[15vh] items-center justify-center border border-r-2 border-t-2 border-black bg-[#fdfd96] md:rounded-tr-3xl">
                  <h1 className="p-5 text-center">
                    {sessionData.data?.startDate?.toDateString()}
                  </h1>
                </div>
                <div className="flex h-[15vh] items-center justify-center border border-black bg-[#fdfd96]">
                  <h1 className="p-5">
                    {sessionData.data?.endDate?.toDateString()}
                  </h1>
                </div>
                <div className="flex h-[15vh] items-center justify-center border border-black bg-[#fdfd96]">
                  <h1 className="p-5">{sessionData.data?.pledge} USD</h1>
                  { role === "SUBS" && endDate ? <RefundButton endDate={endDate} /> : null}
                </div>
                <div className="flex h-[15vh] items-center justify-center border border-b-2 border-black bg-[#fdfd96] md:rounded-br-3xl">
                  <h1 className="p-5">{sessionData.data?.repsAmount}</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          aria-label="progress"
          className="mx-auto h-screen w-full border-black md:h-[60vh] md:w-1/2 "
        >
          <h1 className="mx-auto py-3 text-center font-mono text-4xl font-bold">
            Progress
          </h1>

          <div className="mx-auto flex w-full justify-between px-5 space-x-14 rounded-2xl border-black py-2 font-mono md:w-2/3">
            <h1 className="font-mono text-2xl font-bold">No.</h1>
            <h1 className="font-mono text-2xl font-bold">Date</h1>
            <h1 className="font-mono text-2xl font-bold">Count</h1>
          </div>
          <div
            className="flex flex-col overflow-y-scroll px-5 h-3/4 items-center py-5 space-y-2"
          >
            {progress.data?.map((rep, id) => (
              <div
                className="flex w-full justify-between space-x-3 rounded-lg border border-black bg-white py-2 pl-5 pr-12 font-mono md:w-2/3"
                key={id}
              >
                <h1>{id + 1}</h1>
                <p>{rep.date?.toDateString()}</p>
                <p className="">{rep.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
