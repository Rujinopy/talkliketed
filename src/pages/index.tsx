/* eslint-disable @typescript-eslint/no-unused-vars */
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import { Navbar, RepCounter, Canvas, Webcam, drawSkeleton, 
count, drawCanvas, videoConstraints, addTodayReps,updateRepsForUser } from "./app"
import { useState, useRef, useEffect, } from "react";
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

export const Home: NextPage = (props) => {
  const {user, isSignedIn} = useUser();
  const webRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isChecked, setChecked] = useState(false);
  const [reps, updateReps] = useState(0)

  //create custom mutation hooks
  const useMutation = api.reps.createRepForUser.useMutation();
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

  useEffect(() => {
    if(isSignedIn){
      if(dataQuery.data) {
        updateReps(dataQuery.data.count ?? 0)
      }
    }

  }, [dataQuery.data]);


  useEffect(() => {
    if(dataQuery.data?.count === undefined || dataQuery.data?.count === null) {
      if(isSignedIn){
        void addTodayReps(user, newToday,useMutation)
      }
    }
    //send reps to db
    if (reps > 0) {
      if(isSignedIn){
        //isUpdating is used to prevent multiple calls to the db
        if (!isUpdating) {
          void Promise.resolve(setIsUpdating(true)).then(() => {
            void Promise.resolve(updateRepsForUser(user, newToday, reps, useUpdateRep)).then(() => {
            setIsUpdating(false);
            });
          });
        }
      }
    }
  }, [reps])

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
        updateReps((prev) => prev+count);
        if (context) {
          // Add a check to ensure 'context' is not undefined
          drawCanvas(pose[0], video, videoWidth, videoHeight, canvasRef);
          drawSkeleton(keypoints, context);
        }
      }
    }
    //if the video is not loaded yet, wait for it to load
    // else {
    //   setTimeout(() => {
    //     detectPoseInRealTime(video, net).catch(console.error);
    //   }, 3000);
    // }
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
  
  return (
    <div className="justify-cente flex h-screen w-screen flex-col">
      <section className="border-b border-black">
        <Navbar onStateChanged={handleChecked} />
      </section>
      <section aria-label="body" className="h-screen w-screen bg-[#f8d6b3]">
        {!isSignedIn ? (
          <Link
            className="mx-auto my-5 flex max-w-3xl transform items-center justify-center border-2 border-black bg-[#fdfd96] 
            px-5 py-2 font-mono text-2xl font-medium text-black shadow-lg transition duration-200 hover:bg-[#ffdb58] hover:shadow-neo
            "
            href={"/sign-in"}
          >
            Login to track your goal &#128547;
          </Link>
        ) : (
          <RepCounter date={newToday} userId={user.id} reps={reps} />
        )}
        <div className="md:w-160 md:h-120 relative flex h-auto w-screen justify-center text-center">
          {isChecked ? (
            <Webcam
              className="md:w-160 md:h-120 absolute inset-0 left-0 z-10 mx-auto h-auto text-center"
              ref={webRef}
              videoConstraints={videoConstraints}
            />
          ) : null}
          {isChecked ? (
            <Canvas />
          ) : null}
          {isChecked ? (
            <p className="z-50 mx-auto text-8xl text-white">{reps}</p>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default Home;
