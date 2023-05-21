import { UserProfile } from "@clerk/nextjs";
import { div } from "@tensorflow/tfjs-core";

const UserProfilePage = () => (
  <div className="bg-blue-500 flex justify-center">
    <UserProfile 
    appearance={{

      }}
    path="/user-profile" routing="path" />
  </div>
  );

export default UserProfilePage;