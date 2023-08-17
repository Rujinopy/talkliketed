/* eslint-disable @typescript-eslint/no-unused-vars */
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import {
  Navbar,
  RepCounter,
  Canvas,
  type Webcam,
  drawCanvas,
  VideoMock,
} from "./app";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  type MutableRefObject,
  ChangeEvent,
} from "react";
import { useUser } from "@clerk/nextjs";
import type { NextPage } from "next";
import { api } from "~/utils/api";
import { Toaster, toast } from "react-hot-toast";
import Image from "next/image";
import { calculatePushups, calculateSitUps } from "~/utils/draw";
import debounce from "lodash.debounce";
import { useStore } from "store/stores";

let movenetInterval: NodeJS.Timeout;

//movenet model
const model = poseDetection.SupportedModels.MoveNet;

//movenet config
const detectorConfig = {
  modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
  maxPoses: 1,
  type: "lightning",
  scoreThreshold: 0.3,
  customModel: "",
  enableTracking: false,
};

const convertDate = () => {
  const today = new Date().toDateString();
  const newToday = new Date(today);
  return newToday;
};

//list of exercises
const Guides = [
  "1. Turn on your camera by clicking the button on the top.",
  "2. Align your left side with the camera. It needs to see your full body, for better results.",
  "3. Keep your back straight and do push-ups.",
  "NOTE: The colored skeleton on the side of your body indicates if your back is straight.",
];

interface modeProps {
  mode: string;
  setMode: (mode: string) => void;
}

export const Home: NextPage = (props) => {
  const { user, isSignedIn, isLoaded } = useUser();
  const webRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isChecked, setChecked] = useState(false);
  const [reps, updateReps] = useState(0);
  // const [modes, setModes] = useState("push-ups");
  const mode = useStore((state: unknown) => (state as modeProps).mode);
  const setMode = useStore((state: unknown) => (state as modeProps).setMode);
  const useUpdateRep = api.reps.updateRepsForUser.useMutation({
    onSuccess: () => {
      setIsUpdating(false);
    },
  });
  //today's date in yyyy-mm-dd format
  const newToday = convertDate();

  const [isUpdating, setIsUpdating] = useState(false);
  //fetch today's reps from db
  const dataQuery = api.reps.getRepsForUser.useQuery(
    {
      userId: user?.id ?? "",
      date: newToday,
      mode: mode,
    },
    {
      enabled: isSignedIn === true,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      onSuccess: (data) => {
        if (data.user?.Role !== "USER") {
          if (data?.reps?.count == undefined || data?.reps?.count == null) {

            createRep.mutate({
              userId: user?.id ?? "",
              date: newToday,
              reps: 0,
              mode: mode,
            });
          } 
          
          else if (data?.reps?.count) {

            updateReps(data?.reps?.count);
          }
        }
      },
    }
  );

  //create custom mutation hooks
  const createRep = api.reps.createRepForUser.useMutation({
    onSuccess: () => {
      //refetch data
      dataQuery.refetch().catch((e) => {});
    },
    onError: (e) => {
      const errorMessages = e.data?.zodError?.fieldErrors.message;
      if (errorMessages && errorMessages[0]) {
        toast.error(errorMessages[0]);
      } else {
        toast.error("Failed to create rep. Please try again later.");
      }
    },
  });

  const debouncedUpdateRep = debounce(useUpdateRep.mutateAsync, 2000);
  useEffect(() => {
    //send reps to db
    if (reps > 0) {
      if (isSignedIn) {
        //isUpdating is used to prevent multiple calls to the db
        setIsUpdating(false);
        if (isUpdating === false) {
          debouncedUpdateRep({
            date: newToday,
            reps: reps,
            mode: mode,
          });
        }
      }
    }

    // Clear the debounced function when the component unmounts or when the 'reps' dependency changes.
    return () => {
      debouncedUpdateRep.cancel();
    };
  }, [reps]);

  //detect the pose in real time
  const detectPoseInRealTime = async (
    video: Webcam,
    net: poseDetection.PoseDetector
  ) => {
    //set interval to detect pose every 100ms
    if (video.video) {
      const videoWidth = video.video.videoWidth;
      const videoHeight = video.video.videoHeight;
      canvasRef.current?.setAttribute("width", videoWidth.toString());
      canvasRef.current?.setAttribute("height", videoHeight.toString());
      video.video.width = videoWidth;
      video.video.height = videoHeight;
      const pose = await net.estimatePoses(video.video);
      if (pose[0]) {
        const context = canvasRef.current?.getContext("2d"); // Use optional chaining operator to avoid undefined
        if (context) {
          // Add a check to ensure 'context' is not undefined
          drawCanvas(pose[0], video, videoWidth, videoHeight, canvasRef, mode);

          if (mode === "push-ups") {
            calculatePushups(pose[0].keypoints, handleCountUpdate);
          }
          if (mode === "sit-ups") {
            calculateSitUps(pose[0].keypoints, handleCountUpdate);
          }
        }
      }
    }
  };

  const handleCountUpdate = () => {
    updateReps((prevCount) => prevCount + 1);
  };

  //run movenet
  const runMovenet = async () => {
    const net = await poseDetection.createDetector(model, detectorConfig);

    //detect the pose in real time
    movenetInterval = setInterval(() => {
      if (webRef.current && net) {
        detectPoseInRealTime(webRef.current, net).catch(console.error);
      }
    }, 100);
  };

  //get isChecked state from Navbar for toggling the video
  const handleChecked = () => {
    setChecked(!isChecked);
  };

  useEffect(() => {
    if (isChecked) {
      //stop current movenet
      void tf.ready().catch(console.error);
      runMovenet().catch(console.error);
    }
  }, [isChecked]);

  const handleWebcamRef = useCallback(
    (ref: MutableRefObject<Webcam | null>) => {
      webRef.current = ref.current;
    },
    []
  );

  const handleCanvasRef = useCallback(
    (ref: MutableRefObject<HTMLCanvasElement | null>) => {
      canvasRef.current = ref.current;
    },
    []
  );
  //isLoaded
  if (!isLoaded) {
    return <div className="container text-center">Loading...</div>;
  }

  return (
    <div className="flex h-auto w-screen flex-col justify-center border-b-2 border-black bg-[#daf5f0] font-mono">
      <button
        className="text-stroke-3 text-7xl font-bold text-red-400"
        onClick={() => updateReps((prev) => prev + 1)}
      >
        test
      </button>
      <section className="border-b-2 border-black">
        <Navbar onStateChanged={handleChecked} mode={mode} />
      </section>
      <section
        aria-label="body"
        className="mx-auto h-full w-screen max-w-6xl border-black bg-[#ffb2ef] md:h-auto md:border-x-2"
      >
        <RepCounter
          date={newToday}
          userId={user?.id}
          reps={reps}
          role={dataQuery.data?.user?.Role as string}
          goal={dataQuery.data?.user?.repsAmount as number}
          isSignedIn={isSignedIn ?? false}
        />
        <section className="mx-auto flex h-[90%] max-w-6xl flex-col md:flex-row md:justify-center md:overflow-hidden">
          {/* left */}
          {/* <div className="flex h-[6rem] flex-col items-center justify-center border-black bg-[#ffb2ef] md:h-auto md:basis-1/4 md:border-l-2">
            {!isSignedIn ? (
              <Link
                className="transform border-y-2 border-black bg-[#fdfd96] 
            px-5 py-2 font-mono text-lg font-medium text-black shadow-lg transition duration-200 hover:bg-[#ffdb58] hover:shadow-neo md:text-xl
            "
                href={"/sign-in"}
              >
                Login to customize your daily goal here. &#128547;
              </Link>
            ) : (
              <p className="text-stroke-3 rounded-2xl border-black px-5 py-1 font-mono text-[6rem] font-bold text-white md:border-2 md:bg-[#fdfd96] md:text-[12rem]">
                {reps}
              </p>
            )}
          </div> */}

          {/* middle */}
          <div
            aria-label="video"
            className="relative flex w-screen flex-col overflow-hidden border-black bg-white md:w-full md:basis-3/4 md:flex-row md:border-x-2"
          >
            {isChecked ? (
              <Canvas
                onWebcamRef={handleWebcamRef}
                onCanvasRef={handleCanvasRef}
              />
            ) : (
              <VideoMock />
            )}
          </div>

          {/* right */}
        </section>
      </section>
      <section className="h-auto min-h-screen bg-[#daf5f0]">
        <div className="mx-auto min-h-screen max-w-6xl border-x-2 border-b-2 border-black bg-[#ffb2ef]">
          <div className="flex justify-center pt-5 ">
            <p className="p-2 text-lg">Select Mode:</p>
            <ModeSelector
              setModes={setMode}
              onclick={() => {
                setChecked(false);
                if (dataQuery.data?.user?.Role !== "USER") {
                  dataQuery.refetch().then((data) => updateReps(data.data?.reps?.count ?? 0));
                  
                }
              }}
            />
          </div>
          <h1 className="ml-10 mt-20 w-fit rounded-lg border-2 border-black bg-white px-5 py-3 font-mono font-bold shadow-neo">
            User Guide
          </h1>
          <div className="max-w-4xl space-y-7 px-5 py-8 font-mono text-xl md:px-10">
            <h2>
              This is a push-up counter operated with AI that tracks your
              movement when you&apos;re performing push-ups.
            </h2>
            {Guides.map((guide, id) => (
              <div
                key={id}
                className="flex flex-col space-y-3 rounded-xl border-2 border-black bg-white px-3 py-3"
              >
                <p>{guide}</p>
                {id === 1 ? (
                  <Image
                    src="https://scontent.fbkk2-4.fna.fbcdn.net/v/t39.30808-6/364748037_6382607758484193_5164982862645369181_n.jpg?stp=cp6_dst-jpg&_nc_cat=105&ccb=1-7&_nc_sid=8bfeb9&_nc_eui2=AeGHTRvrYrwsPQe1duDnpYAPjs3PzERQ2ziOzc_MRFDbOJ0ruGh8QGY-WprCeDfcjwy7HTFYsjCY5Gj_eTWsFzEE&_nc_ohc=ohSGO1WDCeAAX-V-Lkl&_nc_zt=23&_nc_ht=scontent.fbkk2-4.fna&oh=00_AfCMC0_zHzebtaGH1HgYFjojUTShLpoIKghNAtQOSzBpHw&oe=64CD6537"
                    alt="lef side of body"
                    className="z-0 mx-auto h-[50%] w-[50%] border-2 border-black"
                    priority={true}
                    width={200}
                    height={200}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : null}
                {id === 2 ? (
                  <Image
                    src="https://cdn.fbsbx.com/v/t59.2708-21/364163958_249548967927181_5477702127242660233_n.gif?_nc_cat=108&ccb=1-7&_nc_sid=041f46&_nc_eui2=AeGazv46saqQtv7s9XZ75vZXeHPFX6NBjC14c8Vfo0GMLYEj4nSDOqVWwiWSCg4b0Qmu2tW7bOPz0faVFmHR8q1O&_nc_ohc=XBJVvEGpcVwAX-7zCp1&_nc_ht=cdn.fbsbx.com&oh=03_AdQzPJgKKz2yPHpWSg-LzlvbbM-C5IE7VbjDQ2np3DQDOg&oe=64CA31BA"
                    alt="doing push-ups"
                    className="z-0 mx-auto h-[50%] w-[50%] border-2 border-black"
                    priority={true}
                    width={500}
                    height={500}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

interface ModeSelectorProps {
  setModes: (mode: string) => void;
  onclick: () => void;
}

export function ModeSelector(props: ModeSelectorProps) {
  const handleClick = (
    e:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectMode = (
      e.currentTarget as HTMLButtonElement | HTMLSelectElement
    ).value;
    props.setModes(selectMode);
    clearInterval(movenetInterval);
    props.onclick();
    toast.success(`Mode changed to ${selectMode}`);
  };
  return (
    <div className="w-auto font-mono ">
      <Toaster
        toastOptions={{
          className: "border-2 border-black",
        }}
      />
      <div className="sm:hidden">
        <label htmlFor="Tab" className="sr-only">
          Tab
        </label>

        <select
          onChange={(e) => handleClick(e)}
          id="Tab"
          className="w-full rounded-md border-2 border-black p-2"
        >
          <option value="push-ups">Push-ups</option>
          <option value="sit-ups">Sit-ups</option>
        </select>
      </div>

      <div className="hidden font-mono sm:block">
        <nav className="flex gap-6" aria-label="Tabs">
          <button
            className="shrink-0 rounded-lg border-2 border-black bg-white p-2 text-lg text-black transition duration-200 hover:translate-x-1 hover:bg-yellow-200 hover:shadow-neo"
            onClick={(e) => {
              handleClick(e);
            }}
            value={"push-ups"}
          >
            Push-ups
          </button>

          <button
            onClick={(e) => {
              handleClick(e);
            }}
            className="shrink-0 rounded-lg border-2 border-black bg-white p-2 text-lg text-black transition duration-200 hover:translate-x-1 hover:bg-yellow-200 hover:shadow-neo"
            value={"sit-ups"}
          >
            Sit-ups
          </button>
        </nav>
      </div>
    </div>
  );
}
