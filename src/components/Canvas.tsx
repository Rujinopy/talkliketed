import React, { type MutableRefObject, useEffect, useRef } from "react";
import Webcam from "react-webcam";

interface Props {
  onWebcamRef: (ref: MutableRefObject<null>) => void;
  onCanvasRef: (ref: MutableRefObject<null>) => void;
}
const Canvas = ({ onWebcamRef, onCanvasRef }: Props) => {
  const camRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    onWebcamRef(camRef);
  }, [onWebcamRef]);

  useEffect(() => {
    onCanvasRef(canvasRef);
  }, [onCanvasRef]);


  return (
    <div className="relative h-[80vh] md:h-full w-full bg-black">
      <Webcam
          ref={camRef}
          audio={false}
          mirrored={true}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: 'user',
            width: { ideal: window.innerWidth },
            height: { ideal: window.innerHeight },
          }}
          className="w-full h-full object-cover md:object-none z-40 border-b-2 border-black"
        />
      <canvas
        ref={canvasRef}
        
        className=" w-full h-full object-cover md:object-none z-50 absolute top-0 left-0 transform -scale-x-100"
      />
    </div>
  );
};

export default Canvas;


