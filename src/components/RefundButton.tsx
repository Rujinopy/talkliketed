import { useState } from "react";
import getStripe from "~/utils/get-stripejs";
import { fetchPostJSON } from "~/utils/api-helpers";
import { Toaster, toast } from "react-hot-toast";
import { api } from "~/utils/api";
import { useStore } from "store/stores";
import { useRouter } from "next/router";
interface RefundData {
  endDate: Date;
  role: string;
  id: string;
}

interface dateStore {
  refundResponse: Record<string, null>
  setRefundResponse: (data: Record<string, null>) => void
  
}

const RefundButton = (props: RefundData) => {
  const setRefundResponse = useStore((state: unknown) => (state as dateStore).setRefundResponse)
  const today = new Date();
  const [isModalOpen, SetModalOpen] = useState(false)
  const router = useRouter()
  const handleSubmit = async () => {

    //create checkout session
    const response = await fetchPostJSON("/api/trpc/refund");

    const stripe = await getStripe();

    if (stripe) {
      if (response.id === undefined || response.id === null) {
        console.warn("response.id is undefined");
        return;
      }
      if(response.status === undefined || response.status === null) {
        console.log("response.status is null")
        return 
      }
      if(response.status as string === "succeeded"){
        setRefundResponse(response)
        router.push(`/refund/${response.id ? response.id : "noId"}`).catch((e) => {
          console.log(e)
        })
      }
    }
  };

  //change role to USER
  const changeRoleToUser = api.reps.changeSubsToUser.useMutation({
    onSuccess: () => {
      toast.success("Successfully refunded");
    }
  });



  const isUserEnded = async (): Promise<void> => {
    if (today > props.endDate || today === props.endDate) {
    if(props.role === "SUBS"){
      await handleSubmit();
    }

    if(props.role === "MEM"){
      changeRoleToUser.mutate({
        userId: props.id,
      });
      
    }
  
  }
  else {
    
    alert("you have not ended your promise yet");

  }
  };

  const toggleModal = () => {
    SetModalOpen(!open)
  }


  return (
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    <div>
      <MakingSureModal open={isModalOpen} SetModalOpen={toggleModal} isUserEnded={isUserEnded}/>
      <Toaster 
      toastOptions={{
        className: "font-mono text-xl border-2 border-black ",
      }}/>
      <button
        className="rounded-lg border-2 border-black bg-red-200 px-1 py-1
                  font-mono text-sm duration-200 hover:translate-x-1 hover:cursor-pointer hover:bg-red-400 
                  "
        onClick={ () => props.role === "USER" ? toast.error("You haven't set custom goal.") : toggleModal}
      >
        claim pledge &#128181;
      </button>
      
    </div>
  );
};

export default RefundButton;

interface OpenModalProps {
  open: boolean,
  SetModalOpen: () => void
  isUserEnded: () => void
}

const MakingSureModal = ({open, SetModalOpen, isUserEnded }: OpenModalProps) => {
  
  return(
    <>
        {open && (
          <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-40 font-mono ">
            <div className="bg-white p-8 rounded-3xl z-50 border-2 border-black">
              <h2 className="text-2xl font-bold mb-4">Refund Status</h2>
              <p>Your refund Status:</p>
              <p>Your money will be added back to your bank account within 5-10 days, in accordance with Stripe&apos;s policy.</p>
              <a href="https://support.stripe.com/questions/understanding-fees-for-refunded-payments">
                <a href="https://support.stripe.com/questions/customer-refund-processing-time"><p className="inline text-gray-400
              hover:underline">1.fees policy</p></a><p className="inline text-gray-400 hover:underline">2.customer refund processing time</p></a>
                <p>Thank you for using Motiflex!</p>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                onClick={() => void isUserEnded}
              >
                Close
              </button>
              <footer>
                <div className="flex justify-center items-center">
                    <p className="text-sm text-gray-400">© 2023 Motiflex</p>
                </div>
            </footer>
            </div>

          </div>
        )}
        </>
  )
}