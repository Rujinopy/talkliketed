import Link from "next/link";
import { useUser, UserButton, SignedIn } from "@clerk/nextjs";
import Navbutton from "./Navbutton";

export default function Navbar(props: { style?: string }) {
  const user = useUser();

  return (
    <div className={`flex mx-auto w-screen h-16 items-center border-y-2 border-black bg-white ${props.style ?? ""}`}>
      <Link href={"/"} className="relative md:w-[15vw] w-[30vw] h-full flex justify-center items-center">
        <p className="font-mono text-lg px-1 md:text-4xl text-center">
          Motiflex
        </p>
      </Link>
      <div className="flex md:w-[70vw] h-full justify-start items-center ">
        <SignedIn>
          <Navbutton title="Set goal" href="/challenge" />
        </SignedIn>
        <Navbutton title="Exercise" href="/exercises" />
        {!user.isSignedIn ? (
          <Navbutton title="Sign In" href="/sign-in" />
        ) : null}
      </div>
      {user.isSignedIn && <div className="scale-150 mx-auto md:pr-10">
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
              card: "border-2 border-black mt-3 mx-auto ml-2 rounded-md",
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
      </div>}
    </div>
  );
}
