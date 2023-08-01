import Link from "next/link";
import { useUser, UserButton, SignedIn } from "@clerk/nextjs";

export default function Navbar(props: { style?: string }) {
  const user = useUser();

  return (
    <div className={`flex h-16 w-screen items-center border-b-2 border-black bg-white ${props.style ?? ""}`}>
      <Link href={"/"}>
        <p className="px-3 font-mono text-3xl md:mx-5 md:my-5 md:text-4xl">
          Motiflex
        </p>
      </Link>
      <SignedIn>
        <Link
          className="my-5 flex text-center h-full transform items-center border-l-2 
        border-r-2 border-black md:px-5 py-1 font-mono text-sm w-28 md:w-auto px-3 md:text-xl font-medium text-black
         transition duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:bg-[#bafca2] hover:shadow-neo md:visible md:relative"
          href="/subscription"
        >
          Set Custom Goal
        </Link>
      </SignedIn>
      {!user.isSignedIn ? (
        <Link
          href="/sign-in"
          className={`my-5 transform border-r-2  border-black px-5 py-1 font-mono ${
            user.isSignedIn ? "" : "border-l-2"
          }
               flex h-full items-center text-xl font-medium text-black transition
               duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:bg-[#87ceeb] hover:shadow-neo md:visible`}
        >
          Sign In
        </Link>
      ) : (
        <div className="my-6 mr-10 scale-150 md:px-5 ml-auto">
          <UserButton
            afterSignOutUrl="/"
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
                card: "border-2 border-black mt-3 mx-auto ml-2",
                userPreviewTextContainer: "font-mono",
                userButtonPopoverActionButtonIcon__manageAccount: "text-black",
                userButtonPopoverActionButtonIcon__signOut: "text-black",
                userButtonPopoverActionButtonText__manageAccount:
                  "font-mono text-black",
                userButtonPopoverActionButtonText__signOut:
                  "font-mono text-black",
                
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
  );
}
