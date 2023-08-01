import Link from "next/link";
import { useState } from "react";
import { useUser, UserButton, SignedIn } from "@clerk/nextjs";
import { Camera } from 'lucide-react';
import Subscription from "./Subscription";

export default function Navbar({onStateChanged}: { onStateChanged: (boolean: boolean) => void }) {
    const [isChecked, setChecked] = useState(false);
    const [color, setColor] = useState("#ff6b6b")
    const user = useUser();

    const handleChecked = () => {
        setChecked(isChecked);
        onStateChanged(isChecked);
    }

    return (
        <div className="flex h-16 items-center w-screen bg-white">
          {/* <MenuBar /> */}
          <Link href={"/"} className="relative">
            <p className="font-mono text-lg px-3 pr-[21px] md:mx-5 md:my-5 md:text-4xl ">Pushup
            {/* <span className="absolute bottom-0 right-0 text-[8px]">by Motiflex</span> */}
            </p>
          </Link>
          <button
            className="border-l-2 border-r-2 my-5 transform  border-black px-2 md:px-5 py-1 font-mono 
            text-md md:text-xl font-medium text-black transition duration-200 hover:-translate-x-1 hover:-translate-y-1 h-full
             hover:bg-[#ff6b6b] flex items-center hover:shadow-neo max-w-sm flex-wrap justify-center w-[5rem] md:w-auto"
            onClick={handleChecked}
            onMouseOver={() => setColor("#fdfd96")}
            onMouseOut={() => setColor("#ff6b6b")}
          >
           <Camera size={24} fill={color} className={`mr-0 md:mr-2`}/> <span className="hidden md:flex">Turn on a webcam</span>
          </button>
          <SignedIn>
            <Subscription />
          </SignedIn>
          {!user.isSignedIn ? (
            <Link
              href="/sign-in"
              className="border-r-2 my-5 transform  border-black px-7 py-1 font-mono 
              text-xl font-medium text-black transition duration-200 hover:-translate-x-1 hover:-translate-y-1 h-full
               hover:bg-[#87ceeb] flex items-center hover:shadow-neo invisible md:visible "
            >
              Sign In
            </Link>
          ) : (
            <div className="my-6 px-5 md:scale-150 md:mr-10 ml-auto">
              <UserButton afterSignOutUrl="/"
              userProfileMode="navigation"
              userProfileUrl={
                typeof window !== "undefined"
                  ? `${window.location.origin}/user-profile`
                  : undefined
              }
                appearance={{
                  elements: {
                    avatarBox:
                      "border border-gray-500 hover:scale-125 transition duration-400",
                    card: "border-2 border-black",
                    userPreviewTextContainer: "font-mono",
                    userButtonPopoverActionButtonIcon__manageAccount: "text-black",
                    userButtonPopoverActionButtonIcon__signOut: "text-black",
                    userButtonPopoverActionButtonText__manageAccount: "font-mono text-black",
                    userButtonPopoverActionButtonText__signOut: "font-mono text-black"
                  },
                }}
              />
            </div>
          )}
          
        </div>
    )
}