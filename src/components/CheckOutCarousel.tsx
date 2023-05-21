
import { div } from "@tensorflow/tfjs-core";
import { useState } from "react";

export default function CheckOutCarousel() {
    const [hoverColor, setHoverColor] = useState("");
    
    const handleHoverColorChange = (color: string) => {
        setHoverColor(color);
    };
    
    return (
        <div>
            
        </div>
    );
}


