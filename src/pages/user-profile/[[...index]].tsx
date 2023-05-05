import { UserProfile } from "@clerk/nextjs";
import { div } from "@tensorflow/tfjs-core";

const UserProfilePage = () => (
  <div className="bg-blue-500 flex justify-center">
    <UserProfile 
    appearance={{
        layout: {
            logoPlacement: "outside",
            logoImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/LEGO_logo.svg/2048px-LEGO_logo.svg.png"
        }
      }}
    path="/user-profile" routing="path" />
  </div>
  );

export default UserProfilePage;