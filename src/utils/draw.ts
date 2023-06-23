
import * as poseDetection from "@tensorflow-models/pose-detection";
import { type Keypoint } from "@tensorflow-models/pose-detection/dist/types";

export let count = 0
const color = "aqua";
const lineWidth = 3;
export let godown = true;
let goup = false;
let back = false
// export let countReps = 0;
let elbowAngle = 0;
function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isMobile() {
  return isAndroid() || isiOS();
}
// let countUpdateCallback: () => void = () => { };

// export function setCountUpdateCallback(callback: () => void) {
//   countUpdateCallback = callback;
// }

export function drawPoint(ctx: CanvasRenderingContext2D, y: number, x: number, r: number, color: string) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = "white";
  ctx.fill();
}

export function drawKeypoints(keypoints: Keypoint[], ctx: CanvasRenderingContext2D, callback: () => void) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];

    if (keypoint?.x && keypoint?.y && keypoint?.score) {
      const x = keypoint.x;
      const y = keypoint.y;
      const score = keypoint.score;
      if (score >= 0.3) {
        drawPoint(ctx, y, x, 6, color);
        updateArmAngle(keypoints);
        isBackStraight(keypoints);
        inUpPosition(callback);
        inDownPosition(keypoints);
      }
    }
  }
}

export function drawSegment(

  [ay, ax]: [number, number],
  [by, bx]: [number, number],
  color: string,
  scale: number,
  ctx: CanvasRenderingContext2D
) {
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
}


export function drawSkeleton(keypoints: Keypoint[], ctx: CanvasRenderingContext2D) {
  const adjacentKeyPoints = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.PoseNet);
  for (let i = 0; i < adjacentKeyPoints.length; i++) {
    //making sure that adjacentKeyPoints[i] is not undefined
    const leftIndex = adjacentKeyPoints[i]?.[0];
    const rightIndex = adjacentKeyPoints[i]?.[1];
    if (leftIndex !== undefined && rightIndex !== undefined) {
      const leftKeypoint = keypoints[leftIndex];
      const rightKeypoint = keypoints[rightIndex];
      if (leftKeypoint?.score && rightKeypoint?.score && leftKeypoint.score > 0.3 && rightKeypoint.score > 0.3) {
        if((i === 6 )){
          if(back ===false){
            drawSegment(
              [leftKeypoint.y, leftKeypoint.x],
              [rightKeypoint.y, rightKeypoint.x],
              "red",
              1,
              ctx
            );
          }
          if(back === true){
          drawSegment(
            [leftKeypoint.y, leftKeypoint.x],
            [rightKeypoint.y, rightKeypoint.x],
            "green",
            1,
            ctx
          );
          }
        }

        else {
        drawSegment(
          [leftKeypoint.y, leftKeypoint.x],
          [rightKeypoint.y, rightKeypoint.x],
          "white",
          1,
          ctx
        );
        }

      }
    }
  }
}

//get angle between 3 points
export function getAngle(
  [ay, ax]: [number, number],
  [by, bx]: [number, number],
  [cy, cx]: [number, number]
) {
  let angle = (Math.atan2(cy - by, cx - bx) - Math.atan2(ay - by, ax - bx)) * 180 / Math.PI;
  if (angle < 0) {
    angle = angle + 360;
  }
  if (angle > 200) {
    angle = angle - 180
  }
  return angle
}

export function drawAngle(
  [ay, ax]: [number, number],
  [by, bx]: [number, number],
  [cy, cx]: [number, number],
  color: string,
  scale: number,
  ctx: CanvasRenderingContext2D
) {
  const angle = getAngle([ay, ax], [by, bx], [cy, cx]);
  ctx.beginPath();
  ctx.arc(ax * scale, ay * scale, 20, 0, angle);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
}

//isNoseaboveElbow function
export function isNoseAboveElbow(keypoints: Keypoint[]) {
  if (keypoints[0] && keypoints[7] && keypoints[8]) {

    //if elbow is above the nose condition
    if (keypoints[7].y < keypoints[0].y || keypoints[8].y < keypoints[0].y) {
      return true;
    }
    else {
      console.log("Keep your elbows above your nose")
      return false;
    }

  }
  else {
    return false;
  }
}

export function isBackStraight(keypoints: Keypoint[]) {
  const leftShoulder = keypoints[5];
  const leftHip = keypoints[11];
  const leftKnee = keypoints[13];

  if (leftShoulder?.score && leftHip?.score && leftKnee?.score && leftShoulder.score > 0.3 && leftHip.score > 0.3 && leftKnee.score > 0.3) {

    const degree = getAngle(
      [leftShoulder.y, leftShoulder.x],
      [leftHip.y, leftHip.x],
      [leftKnee.y, leftKnee.x]
    )
      
    //convert to degree
    if (degree > 160 && degree < 200) {
      back = true;
      console.log("Your back is straight" + `${degree}`)
    }
    else {
      back = false;
      console.log("Keep your back straight" + `${degree}`)
    }
  }
}


export function inUpPosition(callback: () => void) {

  if (elbowAngle > 170 && elbowAngle < 200) {
    if (godown === true) {
      count = count + 1;
      //callback function to update count state in index.tsx
      callback();
    }
    godown = false;
    goup = true;
  }
}

export function inDownPosition(keypoints: Keypoint[]) {
  let elbowAboveNose = false

  if (keypoints[0] && keypoints[7]) {
    if (keypoints[7].y < keypoints[0].y) {
      elbowAboveNose = true;
    }
  }
  // if( isNoseAboveElbow(keypoints) && isBackStraight(keypoints) ) {
  if (elbowAngle > 70 && elbowAngle < 100 && elbowAboveNose === true && back == true) {
    console.log("in down position")
    if (goup === true) {
      // console.log("in down position")
      godown = true;
    }
    goup = false;
  }
}

function updateArmAngle(keypoints: Keypoint[]) {
  const leftWrist = keypoints[9];
  const leftShoulder = keypoints[5];
  const leftElbow = keypoints[7];

  if (leftWrist?.score && leftShoulder?.score && leftElbow?.score && leftWrist.score > 0.3 && leftShoulder.score > 0.3 && leftElbow.score > 0.3) {
    const angle = getAngle(
      [leftShoulder.y, leftShoulder.x],
      [leftElbow.y, leftElbow.x],
      [leftWrist.y, leftWrist.x]
    );
    // console.log(angle);
    if (angle < 0) {
      //angle = angle + 360;
    }

    if (leftWrist.score > 0.3 && leftElbow.score > 0.3 && leftShoulder.score > 0.3) {
      //console.log(angle);
      elbowAngle = angle;
    }
  }
}