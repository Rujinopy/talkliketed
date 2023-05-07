import '@tensorflow/tfjs-backend-webgl';
import { type NextPage } from "next";
import { useState, useRef, useEffect } from "react";
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';

import Link from "next/link";
import {
  drawKeypoints,
  drawSkeleton,
  inUpPosition,
  inDownPosition,
  getAngle
} from "./utils/draw";
import { api } from "~/utils/api";
import Trpc from "./api/trpc/[trpc]";
import Webcam from "react-webcam";
import { type Pose } from "@tensorflow-models/pose-detection/dist/types";
import { useUser, UserButton } from "@clerk/nextjs";
import Script from "next/script";

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

export const Home: NextPage = () => {
  
  const user = useUser();
  const webRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isChecked, setChecked] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [reps, updateReps] = useState(0);
  //goup and godown are used to check if the arm is going up or down
  const [godown, updateGodown] = useState(false);
  const [goup, updateGoup] = useState(true);
  //select the webcam
  // const getDevices = async () => {
  //     const devices = await navigator.mediaDevices.enumerateDevices()
  //     const videoDevices = devices.filter(device => device.kind === 'videoinput')
  //     setDevices(videoDevices)
  //   };
  // const handleDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  //     setSelectedDeviceId(event.target.value);
  //   };
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
 
  //count the reps
function gettingRepsUpdated() {
    updateReps(prevReps => prevReps + 1);
    updateGodown(false);
    updateGoup(true);
    console.log(reps);
  }
  
  function downUpdate(){
    updateGodown(true);
    updateGoup(false);
  }


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
        if (context) {
          // Add a check to ensure 'context' is not undefined
          drawCanvas(pose[0], video, videoWidth, videoHeight, canvasRef);
          drawSkeleton(keypoints, context);
          async function getReps() {
              const leftShoulder = keypoints[5];
              const leftElbow = keypoints[7];
              const leftWrist = keypoints[9];
              
              if (leftShoulder && leftElbow && leftWrist) {
                //awaiting inUpPosion before inDownPosition
                const angle =  getAngle(
                  [leftShoulder.y, leftShoulder.x],
                  [leftElbow.y, leftElbow.x],
                  [leftWrist.y, leftWrist.x]
                );
                await Promise.resolve(inUpPosition(angle, godown, goup, gettingRepsUpdated))
                await Promise.resolve( inDownPosition(angle, keypoints, goup, godown, downUpdate))
              }
              
          }
          await getReps()
        }
      }
    }
    //if the video is not loaded yet, wait for it to load
    else {
      setTimeout(() => {
        detectPoseInRealTime(video, net).catch(console.error);
      }, 300);
    }
  };

  const loadModel = async () => {
    const net = await poseDetection.createDetector(model, detectorConfig);
    //detect the pose in real time
    setInterval(() => {
      if (webRef.current && net) {
        detectPoseInRealTime(webRef.current, net).catch(console.error);
      }
    }, 100);
  };

  if (isChecked) {
    loadModel().catch(console.error);
  }

  return (
    <div className="flex flex-col justify-center ">
      <section className="h-1/2">
        <div className="flex h-20 w-full ">
          <p className="mx-5 my-5 text-4xl font-bold">PushUP</p>
          <button
            className="border-b-1 border-r-1 mx-5 my-5 transform rounded-lg border border-black bg-red-600 px-5 py-2 font-medium  text-white shadow-lg transition duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:border-b-4 hover:border-r-4 hover:bg-red-500 hover:shadow-sm"
            onClick={() => setChecked(!isChecked)}
          >
            Turn on a webcam
          </button>
          {!!user ? (
            <Link
              href="/sign-in"
              className="border-b-1 border-r-1 duration-400 mx-5 my-5 transform rounded-lg border border-blue-800  bg-blue-500 px-5 py-2  font-medium text-white
                  shadow-lg  transition hover:-translate-x-1 hover:-translate-y-1 hover:scale-110 hover:border-b-4 hover:border-r-4 hover:bg-blue-400 hover:shadow-sm"
            >
              Sign In
            </Link>
          ) : (
            <div className="my-6 scale-150">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      "border border-black hover:border-b-2 hover:border-r-2 hover:scale-125 transition duration-400",
                  },
                }}
              />
            </div>
          )}
          <p>{}</p>
        </div>

        {/* <select className="w-1/3 mx-auto" onChange={handleDeviceChange}>
                  <option value={""}>Select a device</option>
                      {devices.map((device, key) => (
                          <option key={device.deviceId} value={device.deviceId} className="text-black">
                              {device.label || `Device ${key + 1}`}
                          </option>
                      ))}
            </select> */}

        <p>{user.user?.primaryEmailAddress?.emailAddress}</p>
        <div className="w-160 h-120 relative">
          {isChecked ? (
            <Webcam
              className="w-160 h-120 w-160 h-120 absolute inset-0 left-0 z-10 mx-auto text-center"
              ref={webRef}
              videoConstraints={videoConstraints}
            />
          ) : null}
          {isChecked ? (
            <canvas
              className="w-160 h-120 w-160 h-120 absolute inset-0 left-0 z-20 mx-auto text-center"
              ref={canvasRef}
            />
          ) : null}
        </div>
      </section>
      {isChecked ? <p className="mx-auto text-8xl z-30 text-white">{reps}</p> : null}
    </div>
  );
};

export default Home;
