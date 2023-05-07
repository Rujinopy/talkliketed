
import * as poseDetection from "@tensorflow-models/pose-detection";
import { type Keypoint } from "@tensorflow-models/pose-detection/dist/types";


const color = "aqua";
const lineWidth = 6;

export let countReps = 0;

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
  ctx.fillStyle = color;
  ctx.fill();
}

export function drawKeypoints(keypoints: Keypoint[], ctx: CanvasRenderingContext2D) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];
    if (keypoint?.x && keypoint?.y && keypoint?.score) {
      const x = keypoint.x;
      const y = keypoint.y;
      const score = keypoint.score;
      if (score >= 0.3) {
      drawPoint(ctx, y, x, 3, color);
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
  ctx.strokeStyle = "white";
  ctx.stroke();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function drawSkeleton(keypoints: Keypoint[], ctx: CanvasRenderingContext2D) {
  const adjacentKeyPoints = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.PoseNet);
  for (let i = 0; i < adjacentKeyPoints.length; i++) {
    //making sure that adjacentKeyPoints[i] is not undefined
      const leftIndex = adjacentKeyPoints[i]?.[0];
      const rightIndex = adjacentKeyPoints[i]?.[1];
      if (leftIndex !== undefined && rightIndex !== undefined){
        const leftKeypoint = keypoints[leftIndex];
        const rightKeypoint = keypoints[rightIndex];
        if (leftKeypoint?.score && rightKeypoint?.score && leftKeypoint.score > 0.3 && rightKeypoint.score > 0.3) {
          drawSegment(
            [leftKeypoint.y, leftKeypoint.x],
            [rightKeypoint.y, rightKeypoint.x],
            color,
            1,
            ctx
          );
        }
      }
  }

  //draw angle at around left elbow using drawAngle function
  const leftShoulder = keypoints[5];
  const leftElbow = keypoints[7];
  const leftWrist = keypoints[9];
  if (leftShoulder?.score && leftElbow?.score && leftWrist?.score && leftShoulder.score > 0.3 && leftElbow.score > 0.3 && leftWrist.score > 0.3) {
    drawAngle(
      [leftShoulder.y, leftShoulder.x],
      [leftElbow.y, leftElbow.x],
      [leftWrist.y, leftWrist.x],
      color,
      1,
      ctx
    );

  }

  //draw angle at around right elbow using drawAngle function
  const rightShoulder = keypoints[6];
  const rightElbow = keypoints[8];
  const rightWrist = keypoints[10];
  if (rightShoulder?.score && rightElbow?.score && rightWrist?.score && rightShoulder.score > 0.3 && rightElbow.score > 0.3 && rightWrist.score > 0.3) {
    drawAngle(
      [rightShoulder.y, rightShoulder.x],
      [rightElbow.y, rightElbow.x],
      [rightWrist.y, rightWrist.x],
      color,
      1,
      ctx
    );
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
  if (keypoints[0] && keypoints[7] && keypoints[8])  {

    //if elbow is above the nose condition
        if (keypoints[7].y < keypoints[0].y || keypoints[8].y < keypoints[0].y ) {
            return true;
    }
  }
}

export function isBackStraight(keypoints: Keypoint[]) {
  const leftShoulder = keypoints[5];
  const leftHip = keypoints[11];
  const leftKnee = keypoints[13];

  if( leftShoulder?.score && leftHip?.score && leftKnee?.score && leftShoulder.score > 0.3 && leftHip.score > 0.3 && leftKnee.score > 0.3) {

  const degree = getAngle(
    [leftShoulder.y, leftShoulder.x],
    [leftHip.y, leftHip.x],
    [leftKnee.y, leftKnee.x]
  )
    //convert to degree
    if (degree > 160 && degree < 200) {
      return true;
    }
    else {
      console.log("Keep your back straight")
    }
  }
}


export function inUpPosition(elbowAngle: number, godown: boolean, goup:boolean, callback: () => void) {

    if (elbowAngle > 170 && elbowAngle < 200) {
      console.log("")
      console.log(godown, goup)

      if(godown === true) {
        godown = false;
        goup = true;
        countReps = countReps + 1;
        console.log("pushhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh")
        callback();
        

      }
      // godown = false;
      //   goup = true;
    }
  }



export function inDownPosition(elbowAngle: number,keypoints: Keypoint[], goup: boolean, godown: boolean, callback: () => void) {
      // if( isNoseAboveElbow(keypoints) && isBackStraight(keypoints) ) {
        if (goup === true && elbowAngle > 70 && elbowAngle < 100) {
          
            console.log("in down position")
            godown = true;
            goup = false;
            console.log(godown, goup)
            callback();
        }
        // else {
        //   //do nothing
        //   console.log("wait for going up")
        // }
      // }  
}

