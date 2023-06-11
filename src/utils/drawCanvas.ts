import Webcam from "react-webcam";
import { type Pose } from "@tensorflow-models/pose-detection/dist/types";
import { drawKeypoints } from "./draw";
import ca from "date-fns/esm/locale/ca/index.js";

const drawCanvas = (
    pose: Pose,
    video: Webcam,
    videoWidth: number,
    videoHeight: number,
    canvas: React.RefObject<HTMLCanvasElement>,
    callback: () => void
  ) => {
    const ctx = canvas.current?.getContext("2d");
    if (canvas.current && ctx) {
      canvas.current.width = videoWidth;
      canvas.current.height = videoHeight;
      drawKeypoints(pose.keypoints, ctx, callback);
    }
  };

  export default drawCanvas;