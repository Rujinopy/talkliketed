import * as poseDetection from "@tensorflow-models/pose-detection";
import { type Keypoint } from "@tensorflow-models/pose-detection/dist/types";

const color = "aqua";
const lineWidth = 3;
let godown = false;
let goup = false;
let back = false
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

export function drawPoint(ctx: CanvasRenderingContext2D, y: number, x: number, r: number, color: string) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = "white";
  ctx.fill();
}

export function drawKeypoints(keypoints: Keypoint[], ctx: CanvasRenderingContext2D) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];

    if (keypoint?.x && keypoint?.y && keypoint?.score) {
      const x = keypoint.x;
      const y = keypoint.y;
      const score = keypoint.score;
      if (score >= 0.5) {
        drawPoint(ctx, y, x, 6, color);
      }
    }
  }
}

export function calculatePushups(keypoints: Keypoint[], callback: () => void) {
  updateArmAngle(keypoints);
  isBackStraight(keypoints);
  inUpPosition(callback);
  inDownPosition(keypoints);
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
      if (leftKeypoint?.score && rightKeypoint?.score && leftKeypoint.score > 0.4 && rightKeypoint.score > 0.4) {
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

export const highlightBack = (keypoints: Keypoint[], ctx: CanvasRenderingContext2D) => {
  if (keypoints[0] && keypoints[5] && keypoints[11] && keypoints[5].score! > 0.4 && keypoints[11].score! > 0.4) {
    if (back === false) {
      drawSegment(
        [keypoints[5].y, keypoints[5].x],
        [keypoints[11].y, keypoints[11].x],
        "red",
        1,
        ctx
      );
      if (keypoints[6] && keypoints[12] && keypoints[6].score! > 0.4 && keypoints[12].score! > 0.4) {
        drawSegment(
          [keypoints[6].y, keypoints[6].x],
          [keypoints[12].y, keypoints[12].x],
          "red",
          1,
          ctx
        );
      }
    }
    else if (back === true) {
      drawSegment(
        [keypoints[5].y, keypoints[5].x],
        [keypoints[11].y, keypoints[11].x],
        "green",
        1,
        ctx
      );
      if (keypoints[6] && keypoints[12] && keypoints[6].score! > 0.4 && keypoints[12].score! > 0.4) {
        drawSegment(
          [keypoints[6].y, keypoints[6].x],
          [keypoints[12].y, keypoints[12].x],
          "green",
          1,
          ctx
        );
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
  const angle = (Math.atan2(cy - by, cx - bx) - Math.atan2(ay - by, ax - bx)) * 180 / Math.PI;
  return angle
}

export function getPositiveAngle(angle: number) {
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
  const rightShoulder = keypoints[6];
  const rightHip = keypoints[12];
  const rightKnee = keypoints[14];

  if ((leftShoulder && leftShoulder?.score && leftHip?.score && leftKnee?.score
    && leftShoulder.score > 0.5 && leftHip.score > 0.5 && leftKnee.score > 0.5)) {
    const degree = getAngle(
      [leftShoulder.y, leftShoulder.x],
      [leftHip.y, leftHip.x],
      [leftKnee.y, leftKnee.x]
    )
    if (degree > 160 && degree < 200) {
      back = true;
    }
    else {
      if (rightShoulder?.score && rightHip?.score && rightKnee?.score && rightShoulder.score > 0.5 && rightHip.score > 0.5 && rightKnee.score > 0.5) {
        const degree = getAngle(
          [rightShoulder.y, rightShoulder.x],
          [rightHip.y, rightHip.x],
          [rightKnee.y, rightKnee.x]
        )
        if (degree > 160 && degree < 200) {
          back = true;
        }
        else {
          back = false;
        }
      }
    }
  }
}

export function inUpPosition(callback: () => void) {

  if (elbowAngle > 170 && elbowAngle < 200) {
    if (godown === true) {
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
  if (keypoints[0] && keypoints[6]) {
    if (keypoints[6].y < keypoints[0].y) {
      elbowAboveNose = true;
    }
  }
  // if( isNoseAboveElbow(keypoints) && isBackStraight(keypoints) ) {
  if (elbowAngle > 70 && elbowAngle < 100 && elbowAboveNose === true && back == true) {
    console.log("in down position")
    if (goup === true) {
      godown = true;
    }
    goup = false;
  }
}

function updateArmAngle(keypoints: Keypoint[]) {
  const leftWrist = keypoints[9];
  const leftShoulder = keypoints[5];
  const leftElbow = keypoints[7];
  const rightWrist = keypoints[10];
  const rightShoulder = keypoints[6];
  const rightElbow = keypoints[8];

  if (leftWrist?.score && leftShoulder?.score && leftElbow?.score && leftWrist.score > 0.3 && leftShoulder.score > 0.3 && leftElbow.score > 0.3) {
    const angle = getPositiveAngle(getAngle(
      [leftShoulder.y, leftShoulder.x],
      [leftElbow.y, leftElbow.x],
      [leftWrist.y, leftWrist.x]
    ))

    if (leftWrist.score > 0.3 && leftElbow.score > 0.3 && leftShoulder.score > 0.3) {
      elbowAngle = angle;
    }
  }
  else if (rightWrist?.score && rightShoulder?.score && rightElbow?.score && rightWrist.score > 0.3 && rightShoulder.score > 0.3 && rightElbow.score > 0.3) {
    const angle = getPositiveAngle(getAngle(
      [rightShoulder.y, rightShoulder.x],
      [rightElbow.y, rightElbow.x],
      [rightWrist.y, rightWrist.x]
    ))

    if (rightWrist.score > 0.3 && rightElbow.score > 0.3 && rightShoulder.score > 0.3) {
      elbowAngle = angle;
    }
  }
}

let situp_down = false;
let situp_up = false;
let backAngle = 0;

function updateBackAngle(keypoints: Keypoint[]) {
  const leftShoulder = keypoints[5];
  const leftHip = keypoints[11];
  const leftKnee = keypoints[13];
  const rightShoulder = keypoints[6];
  const rightHip = keypoints[12];
  const rightKnee = keypoints[14];

  if (leftShoulder?.score && leftHip?.score && leftKnee?.score && leftShoulder.score > 0.3 && leftHip.score > 0.3 && leftKnee.score > 0.3) {
    const degree = getAngle(
      [leftShoulder.y, leftShoulder.x],
      [leftHip.y, leftHip.x],
      [leftKnee.y, leftKnee.x]
    )
    backAngle = Math.abs(degree)
  }

  else if (rightShoulder?.score && rightHip?.score && rightKnee?.score && rightShoulder.score > 0.3 && rightHip.score > 0.3 && rightKnee.score > 0.3) {
    const degree = getAngle(
      [rightShoulder.y, rightShoulder.x],
      [rightHip.y, rightHip.x],
      [rightKnee.y, rightKnee.x]
    )
    backAngle = Math.abs(degree)
  }
}

function isSitupPosition(keypoints: Keypoint[]) {
  const leftHip = keypoints[11];
  const leftAnkle = keypoints[15];

  //check if hip and ankle are on same x axis
  if (leftHip?.score && leftAnkle?.score && leftHip.score > 0.3 && leftAnkle.score > 0.3) {

    if (Math.abs(leftHip.y - leftAnkle.y) < 30) {
      return true;
    }
  }
  return false;
}

function situp_UpPosition(keypoints: Keypoint[]) {
  //check if keypoints 12 and 16 are present and align in x axis not more than 10px
  if (backAngle < 60) {
    if (situp_down === true && isSitupPosition(keypoints)) {
      situp_up = true;
    }
    situp_down = false;
  }

}

function situp_DownPosition(keypoints: Keypoint[], callback: () => void) {

  if (backAngle > 120) {
    if (situp_up === true) {
      callback()
    }
    situp_up = false;
    situp_down = true;
  }
}


export function calculateSitUps(keypoints: Keypoint[], callback: () => void) {
  updateBackAngle(keypoints);
  situp_DownPosition(keypoints, callback);
  situp_UpPosition(keypoints);
}

// Let contributors add their own exercises here
