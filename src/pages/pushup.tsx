/* eslint-disable @typescript-eslint/no-unused-vars */
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import {
  Navbar,
  RepCounter,
  Canvas,
  type Webcam,
  drawSkeleton,
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
import Link from "next/link";
import { toast } from "react-hot-toast";

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
  "NOTE: The colored skeleton on the side of your body indicates if your back is straight."
]


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
      // console.log(dataQuery.data.date);
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
        console.log(newToday);
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
        const keypoints = pose[0].keypoints;
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
          drawSkeleton(keypoints, context);
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
    const intervalId = setInterval(() => {
      if (webRef.current && net) {
        detectPoseInRealTime(webRef.current, net).catch(console.error);
      }
    }, 100);
    //clear interval
    return () => {
      clearInterval(intervalId);
    };
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
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-auto w-screen flex-col justify-center">
      {/* <button
        className="text-stroke-3 font-mono text-7xl font-bold text-red-400"
        onClick={() => updateReps((prev) => prev + 1)}
      >
        test
      </button> */}
      <section className="border-b-2 border-black">
        <Navbar onStateChanged={handleChecked} />
      </section>
      <section aria-label="body" className="md:h-screen h-[70vh] w-screen bg-[#daf5f0]">
        <section className="flex h-full max-w-6xl mx-auto flex-col border-b-2 border-black md:h-screen md:flex-row md:justify-center">
          {/* left */}
          {/* <div className="flex h-72 flex-col justify-center bg-white pb-20 md:h-auto md:basis-1/4 md:pl-8"></div> */}
          <div className="flex h-[6rem] flex-col items-center justify-center border-black bg-[#ffb2ef] md:h-auto md:basis-1/4 md:border-l-2">
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
          </div>
          {/* middle */}
          <div
            aria-label="video"
            className="h-fulll relative w-screen border-black bg-white md:h-auto md:w-auto md:basis-3/4 md:border-x-2"
          >
            <RepCounter
              date={newToday}
              userId={user?.id}
              reps={reps}
              goal={dataQuery.data?.user?.repsAmount as number}
              isSignedIn={isSignedIn ?? false}
            />
            {isChecked ? (
              <Canvas
                onWebcamRef={handleWebcamRef}
                onCanvasRef={handleCanvasRef}
              />
            ) : (
              <VideoMock />
            )}
            {/* <h2 className="underline px-2 py-2 font-mono">Guide</h2>
                  <h2 className="text-center text-md px-14">Align your left side toward the camera. Keep your backstraight and do push-ups.</h2> */}
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
            </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
