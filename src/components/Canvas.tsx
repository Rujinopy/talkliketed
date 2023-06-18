import React, {type MutableRefObject, useEffect, useRef } from "react";
import Webcam from "react-webcam";

interface Props {
  onWebcamRef: (ref: MutableRefObject<null>) => void;
  onCanvasRef: (ref: MutableRefObject<null>) => void;
}
const Canvas = ({ onWebcamRef, onCanvasRef }: Props) =>{
  const camRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    onWebcamRef(camRef);
  }, [onWebcamRef]);

  useEffect(() => {
    onCanvasRef(canvasRef);
  }, [onCanvasRef]);

  
  return (
    <div className="relative w-full h-72 md:mt-10">
      <Webcam
        ref={camRef}
        muted={true}
        className="z-9 absolute inset-0 mx-auto text-center w-full md:h-[30rem] md:w-[40rem] border-black border-2"
      />
      <canvas
        ref={canvasRef}
        className="z-8 absolute inset-0 mx-auto text-center w-full md:h-[30rem] md:w-[40rem]"
      />
    </div>
  );
}

export default Canvas;