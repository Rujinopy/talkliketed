/* eslint-disable @typescript-eslint/no-unused-vars */
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import {
  Navbar,
  RepCounter,
  Canvas,
  Webcam,
  drawSkeleton,
  count,
  drawCanvas,
  VideoMock,
} from "./app";
import { useState, useRef, useEffect, useMemo, useCallback, type MutableRefObject } from "react";
import { useUser } from "@clerk/nextjs";
import type { NextPage } from "next";
import { api } from "~/utils/api";
import Link from "next/link";


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

interface storeProps {
  startDate: Date;
  endDate: Date;
}

const convertDate = () => {
  const today = new Date().toString().slice(0, 15);
  const newToday = new Date(today)
  return newToday
}

export const Home: NextPage = (props) => {
  const { user, isSignedIn } = useUser();
  const webRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isChecked, setChecked] = useState(false);
  const [reps, updateReps] = useState(0);

  //create custom mutation hooks
  const createRep = api.reps.createRepForUser.useMutation();
  const useUpdateRep = api.reps.updateRepsForUser.useMutation({
    onSuccess: () => {
      setIsUpdating(false);
    }
  });
  //today's date in yyyy-mm-dd format
  const newToday = convertDate()

  const [isUpdating, setIsUpdating] = useState(false);
  //fetch today's reps from db
  const dataQuery = api.reps.getRepsForUser.useQuery({
    userId: user?.id ?? "",
    date: newToday,
  } );

  const cachedData = useMemo(() => {
    if(!dataQuery.isSuccess) return null;
    if(dataQuery.data){
    updateReps(dataQuery.data.count ?? 0);
    console.log(dataQuery.data.date)
    return dataQuery.data;}
  }, [dataQuery.data?.count]);
  //update to local state
  // useEffect(() => {
  //   if(!isSignedIn) return;
    
  //     if (dataQuery.data) {
  //       updateReps(dataQuery.data.count ?? 0);
  //       console.log(dataQuery.data.date)
  //   }
  // }, [dataQuery.data, isSignedIn]);

  //create reps only one time when page loads
  useEffect(() => {
    if (isSignedIn === undefined || isSignedIn === null) {
      return;
    }
    if (isSignedIn) {
      if (dataQuery.data?.count !== undefined && dataQuery.data?.count !== null) {
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

  //update reps in db
  useEffect(() => {
    //send reps to db
    if (reps > 0) {
      if (isSignedIn) {
        //isUpdating is used to prevent multiple calls to the db
        if (!isUpdating) {
          void Promise.resolve(setIsUpdating(true)).then(() => {
            // updateRepsForUser(user.id, newToday, reps, useUpdateRep).then(() => {
            //   setIsUpdating(false);
            // });
            void useUpdateRep.mutateAsync({
              date: newToday,
              reps: reps,
            },)
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
        updateReps((prev) => prev + count);
        if (context) {
          // Add a check to ensure 'context' is not undefined
          drawCanvas(pose[0], video, videoWidth, videoHeight, canvasRef);
          drawSkeleton(keypoints, context);
        }
      }
    }
    //if the video is not loaded yet, wait for it to load
    else {
      setTimeout(() => {
        detectPoseInRealTime(video, net).catch(console.error);
      }, 3000);
    }
  };

  //run movenet
  const runMovenet = async () => {
    const net = await poseDetection.createDetector(model, detectorConfig);
    //detect the pose in real time
    const intervalId = setInterval(() => {
      if (webRef.current && net) {
        detectPoseInRealTime(webRef.current, net).catch(console.error);
      }
    }, 10);
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
      tf.ready().catch(console.error);
      runMovenet().catch(console.error);
    }
  }, [isChecked]);

  const handleWebcamRef = useCallback((ref: MutableRefObject<Webcam | null>) => { 
    webRef.current = ref.current; 
  }, []);

  const handleCanvasRef = useCallback((ref: MutableRefObject<HTMLCanvasElement | null>) => {
    canvasRef.current = ref.current;
  }, []);

  return (
    <div className="flex h-auto w-screen flex-col justify-center">
      <button
        className="text-stroke-3 font-mono text-7xl font-bold text-red-400"
        onClick={() => updateReps((prev) => prev + 1)}
      >
        test
      </button>
      <p>{dataQuery.data?.date?.toString() }</p>
      <section className="border-b border-black">
        <Navbar onStateChanged={handleChecked} />
      </section>
      <section aria-label="body" className="h-auto w-screen bg-[#daf5f0]">
        <section className="flex h-auto flex-col-reverse border-b-2 border-black md:h-screen md:flex-row justify-center">
          {/* left */}
          {/* <div className="flex h-72 flex-col justify-center bg-white pb-20 md:h-auto md:basis-1/4 md:pl-8"></div> */}

          {/* middle */}
          <div
            aria-label="video"
            className="relative h-[70vh] w-screen border-black bg-white md:h-auto md:w-auto md:basis-1/2 md:border-x-2"
          >
            <RepCounter date={newToday} userId={user?.id} reps={reps} goal={dataQuery.data?.user?.repsAmount as number} />
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
          <div className="flex h-[8rem] flex-col items-center justify-center bg-[#ffb2ef] md:border-r-2 border-black md:h-auto md:basis-1/4">
            {!isSignedIn ? (
              <Link
                className="transform border-y-2 border-black bg-[#fdfd96] 
            px-5 py-2 font-mono text-2xl font-medium text-black shadow-lg transition duration-200 hover:bg-[#ffdb58] hover:shadow-neo
            "
                href={"/sign-in"}
              >
                Login to track your goal &#128547;
              </Link>
            ) : (
              <p className="text-stroke-3 rounded-2xl border-black px-5 font-mono text-[8rem] font-bold text-white md:border-2 md:bg-[#fdfd96] md:text-[12rem]">
                {reps}
              </p>
            )}
          </div>
        </section>
      </section>
      <section className="h-screen bg-yellow-500"></section>
    </div>
  );
};

export default Home;
