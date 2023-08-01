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
import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  type MutableRefObject,
} from "react";
import { useUser } from "@clerk/nextjs";
import type { NextPage } from "next";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import Image from "next/image";
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
  const today = new Date().toString().slice(0, 15);
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

export const Home: NextPage = (props) => {
  const { user, isSignedIn, isLoaded } = useUser();
  const webRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isChecked, setChecked] = useState(false);
  const [reps, updateReps] = useState(0);

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
    },
    {
      enabled: isSignedIn === true,
    }
  );

  //create custom mutation hooks
  const createRep = api.reps.createRepForUser.useMutation({
    onSuccess: () => {
      //refetch data
      dataQuery.refetch().catch((e) => {
        console.log(e);
      });
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
  const cachedData = useMemo(() => {
    if (!dataQuery.isSuccess) return null;
    if (dataQuery.data) {
      updateReps(dataQuery.data.count ?? 0);
      return dataQuery.data;
    }
  }, [dataQuery.data?.count]);

  // create reps only one time when page loads
  useEffect(() => {
    if (isSignedIn === undefined || isSignedIn === null) {
      return;
    }
    if (isSignedIn) {
      if (
        dataQuery.data?.count !== undefined &&
        dataQuery.data?.count !== null
      ) {
        return;
      }
      if (
        dataQuery.data?.count === undefined ||
        dataQuery.data?.count === null
      ) {
        createRep.mutate({
          userId: user?.id ?? "",
          date: newToday,
          reps: 0,
        });
      }
    }
  }, [isSignedIn]);

  // update reps in db
  useEffect(() => {
    //send reps to db
    if (reps > 0) {
      if (isSignedIn) {
        //isUpdating is used to prevent multiple calls to the db
        if (!isUpdating) {
          void Promise.resolve(setIsUpdating(true)).then(() => {
            void useUpdateRep.mutateAsync({
              date: newToday,
              reps: reps,
            });
          });
        }
      }
    }
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
          drawCanvas(
            pose[0],
            video,
            videoWidth,
            videoHeight,
            canvasRef,
            handleCountUpdate
          );
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
    setInterval(() => {
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
    <div className="flex h-auto w-screen flex-col justify-center bg-[#daf5f0]">
      {/* <button
        className="text-stroke-3 font-mono text-7xl font-bold text-red-400"
        onClick={() => updateReps((prev) => prev + 1)}
      >
        test
      </button> */}
      <section className="border-b-2 border-black">
        <Navbar onStateChanged={handleChecked} />
      </section>
      <section
        aria-label="body"
        className="h-full w-screen border-b-2 md:border-x-2 border-black bg-[#ffb2ef] md:h-auto max-w-6xl mx-auto"
      >
        <RepCounter
              date={newToday}
              userId={user?.id}
              reps={reps}
              goal={dataQuery.data?.user?.repsAmount as number}
              isSignedIn={isSignedIn ?? false}
            />
        <section className="mx-auto h-[90%] flex max-w-6xl flex-col md:flex-row md:justify-center md:overflow-hidden">
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
            className="relative overflow-hidden w-screen border-black bg-white md:w-full md:basis-3/4 md:border-x-2 flex-col flex md:flex-row"
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
        <div className="mx-auto min-h-screen max-w-6xl border-x-2 border-black bg-[#ffb2ef]">
          <h1 className="ml-3 w-fit px-5 py-3 "></h1>
          <h1 className="ml-10 mt-3 w-fit rounded-lg border-2 border-black bg-white px-5 py-3 font-mono font-bold shadow-neo">
            User Guide
          </h1>
          <div className="max-w-4xl space-y-7 px-5 md:px-10 py-8 font-mono text-xl">
            <h2>
            This is a push-up counter operated with AI that tracks your movement when you&apos;re performing push-ups.
            </h2>
            { Guides.map((guide, id) => (
              <div key={id} className="flex flex-col space-y-3 bg-white py-3 px-3 rounded-xl border-black border-2">
                <p>{guide}</p>
                {
                  id === 1 ? <Image
                  src="https://scontent.fbkk2-4.fna.fbcdn.net/v/t39.30808-6/364748037_6382607758484193_5164982862645369181_n.jpg?stp=cp6_dst-jpg&_nc_cat=105&ccb=1-7&_nc_sid=8bfeb9&_nc_eui2=AeGHTRvrYrwsPQe1duDnpYAPjs3PzERQ2ziOzc_MRFDbOJ0ruGh8QGY-WprCeDfcjwy7HTFYsjCY5Gj_eTWsFzEE&_nc_ohc=ohSGO1WDCeAAX-V-Lkl&_nc_zt=23&_nc_ht=scontent.fbkk2-4.fna&oh=00_AfCMC0_zHzebtaGH1HgYFjojUTShLpoIKghNAtQOSzBpHw&oe=64CD6537"
                  alt="lef side of body"
                  className="z-0"
                  priority={true}
                  width={500}
                  height={500}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  
                />
                : null
                }
                {
                  id === 2 ? <Image
                  src="https://cdn.fbsbx.com/v/t59.2708-21/364163958_249548967927181_5477702127242660233_n.gif?_nc_cat=108&ccb=1-7&_nc_sid=041f46&_nc_eui2=AeGazv46saqQtv7s9XZ75vZXeHPFX6NBjC14c8Vfo0GMLYEj4nSDOqVWwiWSCg4b0Qmu2tW7bOPz0faVFmHR8q1O&_nc_ohc=XBJVvEGpcVwAX-7zCp1&_nc_ht=cdn.fbsbx.com&oh=03_AdQzPJgKKz2yPHpWSg-LzlvbbM-C5IE7VbjDQ2np3DQDOg&oe=64CA31BA"
                  alt="doing push-ups"
                  className="z-0"
                  priority={true}
                  width={500}
                  height={500}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  
                />
                : null
                }
            </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
