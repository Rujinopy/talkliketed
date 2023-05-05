import { SignIn } from "@clerk/nextjs";

const SignInPage = () => (
    <div className="flex items-center h-screen justify-center bg-black">
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" afterSignInUrl="/" redirectUrl="/" />
    </div>
  
  );

export default SignInPage;