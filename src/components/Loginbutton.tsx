import { useEffect, useState } from "react";

export default function LoginButton({label, hoverColor, onColorChange}: {label: string, hoverColor: string, onColorChange: (color: string) => void}) {



    return (
        <div>
            <button onMouseEnter={() => onColorChange(hoverColor)} onMouseLeave={() => onColorChange('')} className={`bg-[${hoverColor}] font-mono hover:-translate-x-1 hover:translate-y-1 transition duration-150 
            px-5 py-3 text-2xl border-2 border-black shadow-neo rounded-lg bg-white`}>{label}</button>
        </div>
    );
    }
