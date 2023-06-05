import { api } from "~/utils/api";
import type { NextPage } from "next";
import MenuBar from "~/components/MenuBar";
import NavbarWithoutCam from "~/components/NavbarWithoutCam";
import Title from "~/components/Title";
import { useEffect } from "react";

const UserProfile: NextPage<{ firstname: string }> = ({ firstname }) => {
  const { data } = api.profiles.getProfile.useQuery();
  const progress = api.reps.getAllRepsForUser.useQuery();
  const sessionData = api.reps.checkIfUserExists.useQuery({
    userId: data?.id ?? "",
  });
  console.log(progress.data);

  useEffect(() => {
    console.log("555")
  }, [])

  return (
    <div className="relative w-screen">
    <NavbarWithoutCam />
    <Title title={"Dashboard"}/>
    <MenuBar />
      <div className="flex h-[25vh] flex-col items-center justify-center border-b-2 border-black bg-[#ffb2ef] md:flex-row md:justify-start md:px-44">
        <img
          className="mt-10 h-24 w-24 rounded-full border-2 border-black md:mr-10 md:mt-0"
          src={data?.profileImageUrl}
          alt=""
        />
        <h1 className="text-stroke-3 pb-4 text-[3rem] font-semibold text-[#fdfd96] dark:text-white md:text-[3rem]">
          {data?.firstName}
        </h1>
      </div>
      <div className="flex w-screen bg-[#87ceeb] md:h-[75vh] flex-col border-b-2 border-black md:flex-row">
        <div aria-label="promises" className="mx-auto w-full md:w-1/2 border-black border-r-2">
          <h1 className="mx-auto py-3 text-center font-mono text-4xl font-bold">
            Promises
          </h1>
          <div className="flex h-[60vh] items-center justify-center text-left text-sm text-gray-500 dark:text-gray-400 md:mx-auto md:max-w-5xl">
            <div className="flex rounded-3xl md:shadow-neo bg-white ">
              <div
                aria-label="titles"
                className="flex w-3/12 flex-col font-mono text-2xl uppercase text-black md:text-xl"
              >
                <div className="flex h-[15vh] items-center justify-center border border-l-2 border-t-2 border-black md:rounded-tl-2xl">
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

          <div className="font-mono mx-auto flex justify-between space-x-14 rounded-2xl py-2 border-black w-full md:w-2/3" >
              <h1 className="font-bold font-mono text-2xl">No.</h1>
              <h1 className="font-bold font-mono text-2xl">Date</h1>
              <h1 className="font-bold font-mono text-2xl">Count</h1>
            </div>
          <div
            className="mx-auto flex h-full w-full md:justify-center flex-col
        items-center space-y-5 overflow-y-auto md:mx-auto md:max-w-5xl rounded-2xl"
          >
            
            {progress.data?.map((rep, id) => (
              <div className="bg-white font-mono shadow-neo flex space-x-3 justify-between pr-12 border rounded-lg py-2 pl-5 border-black w-full md:w-2/3" key={id}>
                <h1>{id +1 }</h1>
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
