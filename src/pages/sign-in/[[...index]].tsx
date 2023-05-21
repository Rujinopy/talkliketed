import { SignIn } from "@clerk/nextjs";
import { useRouter } from "next/router";
function SignInPage() {

    //check previous page
    const router = useRouter();
    const { previousPage } = router.query;
    console.log(previousPage);

    return (
    <div className="flex flex-col items-center h-screen justify-center bg-[#f8d6b3]">
        <p className="font-sans text-8xl p-5">pushup</p>
        <div className="px-2 md:px-2">
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" 
        appearance={
          {
            layout: {},
            variables: {
              colorPrimary: "#ff6b6b",
              colorTextSecondary: "#000",
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
                "boxShadow": "3px 3px 0px #000"
               },
               "footer": {
                "& + div": {
                 "border": "2px solid #000",
                 "boxShadow": "-4px 1px 0 0 #000"
                }
               },
          }
          }
        } 
        
        />
        </div>
    </div>
  
    )
      }

export default SignInPage;