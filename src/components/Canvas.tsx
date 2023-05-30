import React, { useEffect, useRef } from "react";
import Webcam from "react-webcam";
const Canvas = ({ onWebcamRef, onCanvasRef }: any) =>{
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
        className="z-9 absolute inset-0 mx-auto text-center w-full md:h-[30rem] md:w-[40rem] border-red-500 border-2"
      />
      <canvas
        ref={canvasRef}
        className="z-8 absolute inset-0 mx-auto text-center w-full md:h-[30rem] md:w-[40rem]"
      />
    </div>
  );
}

export default Canvas;