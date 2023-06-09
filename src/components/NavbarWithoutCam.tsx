import Link from "next/link";
import { useUser, UserButton, SignedIn } from "@clerk/nextjs";

export default function Navbar() {
    const user = useUser();
    

    return (
        <div className="flex h-16 items-center w-screen border-b-2 border-black bg-white">
          <Link href={"/"}>
            <p className="font-mono text-lg px-3 md:mx-5 md:my-5 md:text-4xl">Pushup</p>
          </Link>
          <SignedIn>
          <Link className="border-r-2 border-l-2 my-5 transform  border-black px-5 py-1 font-mono 
        text-xl font-medium text-black transition duration-200 hover:-translate-x-1 hover:-translate-y-1 h-full
         hover:bg-[#bafca2] flex items-center hover:shadow-neo absolute md:relative invisible md:visible" href="/subscription">
            Set Custom Goal
        </Link>
          </SignedIn>
          {!user.isSignedIn ? (
            <Link
              href="/sign-in"
              className="border-r-2 my-5 transform  border-black px-5 py-1 font-mono 
              text-xl font-medium text-black transition duration-200 hover:-translate-x-1 hover:-translate-y-1 h-full
               hover:bg-[#87ceeb] flex items-center hover:shadow-neo invisible md:visible "
            >
              Sign In
            </Link>
          ) : (
            <div className="my-6 scale-150 px-5 md:ml-auto mr-10">
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
          {/* <Link
              href="/sign-in"
              className="border-r-2 my-5 transform  border-black px-5 py-1 font-mono 
              text-xl font-medium text-black transition duration-200 hover:-translate-x-1 hover:-translate-y-1 h-full
               hover:bg-[#87ceeb] flex items-center hover:shadow-neo invisible md:visible "
            >
              Sign 
            </Link> */}
        </div>
    )
}