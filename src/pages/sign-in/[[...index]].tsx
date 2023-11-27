import { SignIn } from "@clerk/nextjs";
import { useRouter } from "next/router";
import Link from "next/link";
function SignInPage() {

  //check previous page
  const router = useRouter();
  const { previousPage } = router.query;

  return (
    <div className="flex flex-col items-center min-h-screen justify-center bg-[#a388ee]">
      <Link href="/" className="font-mono text-6xl p-5 font-bold text-stroke-3 text-[#fdfd96]">Motiflex</Link>
      <div className="px-2 md:px-2">
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up"
          afterSignInUrl={previousPage ? previousPage as string : "/exercises"}
          appearance={
            {
              layout: {},
              variables: {
                colorPrimary: "#fdfd96",
                colorTextSecondary: "#000",
                colorTextOnPrimaryBackground: "#000",
              },
              elements: {
                card: {
                  boxShadow: "7px 7px 0px #000",
                  border: "3px solid #000"
                },
                socialButtonsIconButton: {
                  height: "2.5rem",
                  boxShadow: "3px 3px 0px #000",
                  borderRadius: "0.5rem",
                  border: "2px solid #000",
                  "&:hover": {
                    boxShadow: "4px 4px 0px #000",
                    border: "2px solid #000",
                    transform: "scale(1.01)"
                  },
                  "&:active": {
                    boxShadow: "2px 2px 0px #000",
                    transform: "translate(1px)"
                  }
                },
                "formFieldInput": {
                  "boxShadow": "3px 3px 0px #000",
                  "border": "2px solid #000",
                  "transition": "all 0.2s ease-in-out",
                  "padding": "0.6175rem 1rem",
                  "&:focus": {
                    "boxShadow": "4px 4px 0px #000",
                    "border": "2px solid #000",
                    "transform": "scale(1.01)"
                  }
                },
                "formButtonPrimary": {
                  "height": "2.5rem",
                  "border": "2px solid #000",
                  "boxShadow": "3px 3px 0px #000",
                  "color": "#000"
                },
                "footer": {
                  "& + div": {
                    "border": "2px solid #000",
                    "boxShadow": "-4px 1px 0 0 #000",
                    "color": "#000"
                  }
                },
                "footerActionLink": {
                  "color": "#a388ee",
                }
              }
            }
          }

        />
      </div>
    </div>

  )
}

export default SignInPage;