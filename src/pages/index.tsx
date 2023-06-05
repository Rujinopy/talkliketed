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
  addTodayReps,
  updateRepsForUser,
  VideoMock
} from "./app";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import type { NextPage } from "next";
import { api } from "~/utils/api";
import Link from "next/link";
import { memo } from "react";
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

export const Home: NextPage = (props) => {
  const { user, isSignedIn } = useUser();
  const webRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isChecked, setChecked] = useState(false);
  const [reps, updateReps] = useState(0);

  //create custom mutation hooks
  const createRep = api.reps.createRepForUser.useMutation();
  const useUpdateRep = api.reps.updateRepsForUser.useMutation();
  //today's date in yyyy-mm-dd format
  const today = new Date().toISOString().slice(0, 10);
  const newToday = new Date(today);
  const [isUpdating, setIsUpdating] = useState(false);
  //fetch today's reps from db
  const dataQuery = api.reps.getRepsForUser.useQuery({
    userId: user?.id ?? "",
    date: newToday,
  });

  //update to local state
  useEffect(() => {
    if (isSignedIn) {
      if (dataQuery.data) {
        updateReps(dataQuery.data.count ?? 0);
      }
    }
  }, [dataQuery.data, isSignedIn]);

  //create reps only one time when page loads
  useEffect(() => {
    createRep.mutate({
      userId: user?.id ?? "",
      date: newToday,
      reps: 0,
    });
  }, []);


  //update reps in db
  useEffect(() => {
    //send reps to db
    if (reps > 0) {
      if (isSignedIn) {
        //isUpdating is used to prevent multiple calls to the db
        if (!isUpdating) {
          void Promise.resolve(setIsUpdating(true)).then(() => {
            void Promise.resolve(
              updateRepsForUser(user, newToday, reps, useUpdateRep)
            ).then(() => {
              setIsUpdating(false);
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

  const handleWebcamRef = useCallback((ref: any) => {
    webRef.current = ref;
  }, [])

  const handleCanvasRef = useCallback((ref: any) => {
    canvasRef.current = ref;
  }, [])

  return (
    <div className="flex h-auto w-screen flex-col justify-center">
      <button className="text-stroke-3 text-7xl text-red-400 font-mono font-bold" onClick={() => updateReps((prev) => prev + 1)}>test</button>
      <section className="border-b border-black">
        <Navbar onStateChanged={handleChecked} />
      </section>
      <section aria-label="body" className="h-auto w-screen bg-[#f8d6b3]">
        <section className="flex flex-col-reverse md:flex-row md:h-screen h-auto border-b-2 border-black">

          {/* left */}
          <div className="h-72 md:h-auto md:basis-1/4 flex flex-col md:pl-8 justify-center pb-20 bg-[#ffb2ef]">
          
          </div>

          {/* middle */}
          <div
            aria-label="video"
            className="md:basis-1/2 relative h-auto w-screen md:h-auto md:w-auto bg-white md:border-x-2 border-black"
          >
            <RepCounter date={newToday} userId={user?.id} reps={reps} />
            {isChecked ? (
            <Canvas onWebcamRef={handleWebcamRef} onCanvasRef={handleCanvasRef} /> ): <VideoMock />
            }
          </div>

          {/* right */}
          <div className="md:basis-1/4 h-[8rem] md:h-auto items-center justify-center flex-col flex bg-[#ffb2ef]">
          {!isSignedIn ? (
          <Link
            className="transform border-2 border-black bg-[#fdfd96] 
            px-5 py-2 font-mono text-2xl font-medium text-black shadow-lg transition duration-200 hover:bg-[#ffdb58] hover:shadow-neo
            "
            href={"/sign-in"}
          >
            Login to track your goal &#128547;
          </Link>
        ) : 
            <p className="text-[8rem] md:text-[12rem] font-bold font-mono text-white text-stroke-3 px-5 md:bg-[#fdfd96] rounded-2xl md:border-2 border-black">{reps}</p>}
          </div>
        </section>
      </section>
      <section className="h-screen bg-yellow-500"></section>
    </div>
  );
};

export default Home;
