import Webcam from "react-webcam";
import { type Pose } from "@tensorflow-models/pose-detection/dist/types";
import { drawKeypoints, drawSkeleton, highlightBack } from "./draw";

const drawCanvas = (
    pose: Pose,
    video: Webcam,
    videoWidth: number,
    videoHeight: number,
    canvas: React.RefObject<HTMLCanvasElement>,
    modes: string
  ) => {
    const ctx = canvas.current?.getContext("2d");
    if (canvas.current && ctx) {
      canvas.current.width = videoWidth;
      canvas.current.height = videoHeight;
      drawKeypoints(pose.keypoints, ctx);
      drawSkeleton(pose.keypoints, ctx)
      if(modes === "push-ups"){
      highlightBack(pose.keypoints, ctx)
      }
    }
  };

  export default drawCanvas;