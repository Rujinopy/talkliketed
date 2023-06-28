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
import Histories from "~/components/Histories";
import { daysDifference } from "~/utils/dateHelpers";

const UserProfile: NextPage<{ firstname: string }> = ({ firstname }) => {
  const { isSignedIn, user } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = api.reps.infiniteSessionHistory.useInfiniteQuery(
    {
      userId: user?.id ?? "",
      limit: 4,
    },
    {
      onSuccess: () => {
        console.log(data?.pages);
      },
      enabled: isSignedIn === true,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  const profile = api.profiles.getProfile.useQuery(undefined, {
    enabled: isSignedIn === true,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: Infinity,
  });

  const sessionData = api.reps.checkIfUserExists.useQuery(
    {
      userId: "",
    },
    {
      enabled: isSignedIn === true,
      refetchOnWindowFocus: false,
    }
  );

  const role = useMemo(() => sessionData.data?.Role, [sessionData.data?.Role]);
  // const pledge = sessionData.data?.pledge;
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
      startDate: sessionData.data?.startDate!,
      endDate: sessionData.data?.endDate!,
    },
    {
      enabled: role === "SUBS" && isSignedIn === true,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  if (isSignedIn === false) {
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
      <NameAndStatus
        role={role ?? ""}
        firstName={profile.data?.firstName ?? "User"}
        imageURL={profile.data ? profile.data.profileImageUrl : ""}
      />
      <div className="flex w-screen flex-col border-b-2 border-black bg-[#87ceeb] md:h-[75vh] md:flex-row">
        <div
          aria-label="promises"
          className="mx-auto w-full border-black md:w-1/2 md:border-r-2"
        >
          <h1 className="mx-auto border-b-2 border-black bg-white py-3 text-center font-mono text-4xl font-bold">
            Sessions
          </h1>
          <div className="mt-5 flex h-[60vh] items-center justify-center text-left text-sm text-gray-500 dark:text-gray-400 md:mx-auto">
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
                    <RefundButton
                      startDate={startDate ?? new Date()}
                      endDate={endDate}
                      role={role}
                      id={user?.id ?? ""}
                      pledge={sessionData.data?.pledge ?? 0}
                      payment_intent={sessionData.data?.payment_intent ?? ""}
                    />
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
          <h1 className="mx-auto border-y-2 border-black bg-white py-3 text-center font-mono text-4xl font-bold md:border-b-2 md:border-t-0">
            Current Progress
          </h1>
          <h1
            className={`mx-auto border-b-2 border-black bg-white py-2 text-center 
          font-mono text-xl md:border-b-2 md:border-t-0 ${role === "USER" ? "hidden" : ""}`}
          >
            {daysDifference(
              startDate ?? new Date(startDate!),
              endDate ?? new Date(endDate!)
            ) + 1}-day goal for full pledge refund.
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
      <div className="h-screen w-screen">
        <h1 className="mx-auto border-b-2 border-black bg-white py-3 text-center font-mono text-4xl font-bold">
          history
        </h1>
        <div>
          <div className="flex w-full divide-x-2 divide-black border-b-2 border-black bg-white font-bold md:text-2xl">
            <div className="w-1/12">
              <h1 className="pl-1 text-center font-mono ">No.</h1>
            </div>
            <div className="w-1/4">
              <h1 className="pl-1 font-mono ">Start-End</h1>
            </div>
            <div className="w-1/6 md:w-1/12">
              <h1 className="pl-2 font-mono ">Status</h1>
            </div>
            <div className="w-1/6 md:w-1/12">
              <h1 className="pl-2 font-mono ">Pledge</h1>
            </div>
            <div className="w-1/12">
              <h1 className="pl-3 font-mono ">Activity</h1>
            </div>
          </div>
          {data?.pages.map((group, i) =>
            group.session.map((session, id) => (
              <Histories session={session} id={id} />
            ))
          )}
        </div>
        <div className="flex w-full justify-center pt-5">
          <button
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
            className="w-48 rounded-md border-2 border-black px-3 py-2 text-center font-mono text-xl transition delay-100 hover:translate-y-2 hover:cursor-pointer hover:bg-[#fdfd96] hover:shadow-neo"
          >
            {isFetchingNextPage
              ? "Loading more..."
              : hasNextPage
              ? "Load More"
              : "Nothing more to load"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

export function NameAndStatus({
  role,
  firstName,
  imageURL,
}: {
  role: string;
  firstName: string;
  imageURL: string;
}) {
  return (
    <div className="flex h-[40vh] flex-col items-center justify-center border-b-2 border-black bg-[#ffb2ef] md:h-[25vh] md:flex-row md:justify-start md:px-44">
      <Image
        className="mt-10 rounded-full border-2 border-black md:mr-10 md:mt-0"
        src={imageURL}
        alt=""
        width={80}
        height={80}
      />
      <div className="flex flex-col items-center justify-center md:items-start md:justify-normal">
        <h1 className="text-stroke-3 text-[3rem] font-semibold text-[#fdfd96] dark:text-white md:text-[3rem]">
          {firstName}
        </h1>
        <div className="flex flex-col ">
          <h2 className="py-2 font-mono">status: </h2>
          <StatusBar role={role ?? ""} />
        </div>
      </div>
    </div>
  );
}
