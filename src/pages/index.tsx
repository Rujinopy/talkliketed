/* eslint-disable @typescript-eslint/no-unused-vars */
import "@tensorflow/tfjs-backend-webgl";
import { type NextPage } from "next";
import { useState, useRef, useEffect } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
import Link from "next/link";
import { drawKeypoints, drawSkeleton, count } from "./utils/draw";
import { api } from "~/utils/api";
// import Trpc from "./api/trpc/[trpc]";
import Webcam from "react-webcam";
import { type Pose } from "@tensorflow-models/pose-detection/dist/types";
import { useUser, UserButton } from "@clerk/nextjs";
import RepCounter from "~/components/RepCounter";
import Navbar from "~/components/Navbar";
import { useStore } from "store/stores";

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

export const Home: NextPage = () => {
  const user = useUser();
  const webRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isChecked, setChecked] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [reps, updateReps] = useState(0);
  const startDate = useStore((state: unknown) => (state as storeProps).startDate);
  console.log(startDate)
  //get isChecked state from Navbar
  const handleChecked = () => {
    setChecked(!isChecked);
  };

  const videoConstraints = {
    deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
    width: 640,
    height: 480,
  };

  //draw the canvas and the keypoints on the video
  const drawCanvas = (
    pose: Pose,
    video: Webcam,
    videoWidth: number,
    videoHeight: number,
    canvas: React.RefObject<HTMLCanvasElement>
  ) => {
    const ctx = canvas.current?.getContext("2d");
    if (canvas.current && ctx) {
      canvas.current.width = videoWidth;
      canvas.current.height = videoHeight;
      drawKeypoints(pose.keypoints, ctx);
    }
  };

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
        updateReps(count);
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

  useEffect(() => {
    if (isChecked) {
      tf.ready().catch(console.error);
      runMovenet().catch(console.error);
    }
  }, [isChecked]);
  
  return (
    <div className="flex flex-col justify-cente w-screen h-screen">
      <section className="border-b border-black">
        <Navbar onStateChanged={handleChecked} />
      </section>
      <section aria-label="body" className="w-screen h-screen bg-[#f8d6b3]">
        {!user.isSignedIn ? (
          <Link
            className="mx-auto max-w-3xl my-5 flex transform items-center justify-center border-2 border-black bg-[#fdfd96] 
            px-5 py-2 font-mono text-2xl font-medium text-black shadow-lg transition duration-200 hover:bg-[#ffdb58] hover:shadow-neo
            "
            href={"/sign-in"}
          >
            Login to track your goal &#128547;
          </Link>
        ) : (
          <RepCounter userId={user.user?.id} reps={reps} />
        )}
        <div className="w-screen h-auto md:w-160 md:h-120 relative text-center flex justify-center">
          {isChecked ? (
            <Webcam
              className="h-auto md:w-160 md:h-120 absolute inset-0 left-0 z-10 mx-auto text-center"
              ref={webRef}
              videoConstraints={videoConstraints}
            />
          ) : null}
          {isChecked ? (
            <canvas
              className="h-auto md:w-160 md:h-120 absolute inset-0 left-0 z-20 mx-auto text-center"
              ref={canvasRef}
            />
          ) : null}
          {isChecked ? (
          <p className="z-50 text-8xl mx-auto text-white">{reps}</p>
        ) : null}
        </div>

        
      </section>
    </div>
  );
};

export default Home;

