import { api } from "~/utils/api";
import type { NextPage } from "next";
import NavbarWithoutCam from "~/components/NavbarWithoutCam";
import Title from "~/components/Title";
import { useMemo, useState } from "react";
import RefundButton from "~/components/RefundButton";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import StatusBar from "~/components/StatusBar";
import RefundModal from "~/components/RefundModal";
const UserProfile: NextPage<{ firstname: string }> = ({ firstname }) => {
  const { isSignedIn, user } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
 
  const { data } = api.profiles.getProfile.useQuery(undefined, {
    enabled: isSignedIn === true,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: Infinity,
  });

  const sessionData = api.reps.checkIfUserExists.useQuery(
    {
      userId: data?.id ?? "",
    },
    {
      enabled: isSignedIn === true,
      refetchOnWindowFocus: false,
    }
  );

  const role = useMemo(() => sessionData.data?.Role, [sessionData.data?.Role]);
  const endDate = useMemo(
    () => sessionData.data?.endDate,
    [sessionData.data?.endDate]
  );
  const startDate = useMemo(
    () => sessionData.data?.startDate,
    [sessionData.data?.startDate]
  );

  const progress = api.reps.getAllRepsForUser.useQuery(
    {
      startDate: sessionData.data?.startDate ?? new Date(),
      endDate: sessionData.data?.endDate ?? new Date(),
    },
    {
      enabled: isSignedIn === true,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  if (isSignedIn === false || !data) {
    return (
      <>
        <NavbarWithoutCam style="z-50" />
        <div className="flex h-screen flex-col items-center justify-center">
          <h1 className="text-center text-4xl font-bold">
            Please sign in to view your profile
          </h1>
        </div>
      </>
    );
  }

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };
  return (
    <div className="relative w-screen">
      <RefundModal open={modalOpen} toggleModal={toggleModal} />
      <NavbarWithoutCam style="sticky top-0 z-50" />
      <Title title={"Dashboard"} />
      {/* <MenuBar /> */}
      <div className="flex h-[40vh] flex-col items-center justify-center border-b-2 border-black bg-[#ffb2ef] md:h-[25vh] md:flex-row md:justify-start md:px-44">
        <Image
          className="mt-10 rounded-full border-2 border-black md:mr-10 md:mt-0"
          src={data ? data.profileImageUrl : ""}
          alt=""
          width={80}
          height={80}
        />
        <div className="flex flex-col items-center justify-center md:items-start md:justify-normal">
          <h1 className="text-stroke-3 text-[3rem] font-semibold text-[#fdfd96] dark:text-white md:text-[3rem]">
            {data?.firstName}
          </h1>
          <StatusBar role={role ?? ""} />
        </div>
      </div>
      <div className="flex w-screen flex-col border-b-2 border-black bg-[#87ceeb] md:h-[75vh] md:flex-row">
        <div
          aria-label="promises"
          className="mx-auto w-full border-black md:w-1/2 md:border-r-2"
        >
          <h1 className="mx-auto py-3 text-center font-mono text-4xl font-bold">
            Sessions
          </h1>
          <div className="flex h-[60vh] items-center justify-center text-left text-sm text-gray-500 dark:text-gray-400 md:mx-auto">
            <div className="flex w-96 bg-white md:rounded-lg md:shadow-neo">
              <div
                aria-label="titles"
                className="flex w-3/12 flex-col font-mono text-2xl uppercase text-black md:text-xl"
              >
                <div className="flex h-[15vh] items-center justify-center border border-l-2 border-t-2 border-black md:rounded-tl-lg">
                  <h1 className="p-5 text-center">Start</h1>
                </div>
                <div className="flex h-[15vh] items-center justify-center border border-l-2 border-black">
                  <h1 className="p-5">End</h1>
                </div>
                <div className="flex h-[15vh] items-center justify-center border border-l-2 border-black">
                  <h1 className="p-5">Pledge</h1>
                </div>
                <div className="flex h-[15vh] items-center justify-center border border-b-2 border-l-2 border-black md:rounded-bl-lg">
                  <h1 className="p-5">Reps per day</h1>
                </div>
              </div>
              <div
                aria-label="content"
                className=" flex w-9/12 flex-col font-mono text-2xl text-black"
              >
                <div className="flex h-[15vh] items-center justify-center border border-r-2 border-t-2 border-black bg-[#fdfd96] md:rounded-tr-lg">
                  <h1 className="p-5 text-center">
                    {sessionData.data?.startDate?.toDateString() ?? "N/A"}
                  </h1>
                </div>
                <div className="flex h-[15vh] items-center justify-center border border-black bg-[#fdfd96]">
                  <h1 className="p-5">
                    {sessionData.data?.endDate?.toDateString() ?? "N/A"}
                  </h1>
                </div>
                <div className="flex h-[15vh] flex-col items-center justify-center border border-black bg-[#fdfd96]">
                  <h1 className="p-1">{sessionData.data?.pledge} USD</h1>
                  {role && endDate ? (
                    <RefundButton startDate={startDate ?? new Date()} endDate={endDate} role={role} id={user?.id ?? ""}/>
                  ) : null}
                </div>
                <div className="flex h-[15vh] items-center justify-center border border-b-2 border-black bg-[#fdfd96] md:rounded-br-lg">
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
            Current Progress
          </h1>

          <div className="mx-auto flex w-full justify-between space-x-14 rounded-2xl border-black px-5 py-2 font-mono md:w-2/3">
            <h1 className="font-mono text-2xl font-bold">No.</h1>
            <h1 className="font-mono text-2xl font-bold">Date</h1>
            <h1 className="font-mono text-2xl font-bold">Count</h1>
          </div>
          <div className="flex h-3/4 flex-col items-center space-y-2 overflow-y-scroll px-5 py-5">
            {progress.data?.map((rep, id) => (
              <div
                className="flex w-full justify-between space-x-3 rounded-lg border border-black bg-white py-2 pl-5 pr-12 font-mono md:w-2/3"
                key={id}
              >
                <h1>{id + 1}</h1>
                <p>{rep.date?.toDateString().replaceAll(" ", "/").slice(4)}</p>
                <p className="">{rep.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-screen">
        <h1 className="py-5 text-center font-mono text-4xl">history</h1>
      </div>
    </div>
  );
};

export default UserProfile;
