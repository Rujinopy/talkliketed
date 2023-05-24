import { useEffect, useRef } from 'react';

export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    return (
        <div>
            <canvas className="md:w-160 md:h-120 absolute inset-0 left-0 z-20 mx-auto h-auto text-center" ref={canvasRef} />
        </div>
    );
}