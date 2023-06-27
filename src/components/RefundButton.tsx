import { useState } from "react";
import getStripe from "~/utils/get-stripejs";
import { fetchPostJSON } from "~/utils/api-helpers";
import { Toaster, toast } from "react-hot-toast";
import { api } from "~/utils/api";
import { useStore } from "store/stores";
import { useRouter } from "next/router";
interface RefundData {
  startDate: Date;
  endDate: Date;
  role: string;
  id: string;
  pledge: number;
  payment_intent: string;
}

interface dateStore {
  refundResponse: Record<string, null>;
  setRefundResponse: (data: Record<string, null>) => void;
}

const RefundButton = (props: RefundData) => {
  //change role to USER
  const changeRoleToUser = api.reps.changeSubsToUser.useMutation({
    onSuccess: () => {
      toast.success("End the promised session.");
    },
  });
  const addSessionToDB = api.reps.addSessionHistory.useMutation({
    onSuccess: () => {
      toast.success("Successfully reclaim pledge!");
    },
  });
  const setRefundResponse = useStore(
    (state: unknown) => (state as dateStore).setRefundResponse
  );
  const today = new Date();
  const [isModalOpen, SetModalOpen] = useState(false);
  const router = useRouter();
  const handleSubmit = async () => {
    //create checkout session
    const response = await fetchPostJSON("/api/trpc/refund", {
      startDate: props.startDate.toISOString(),
      endDate: props.endDate.toISOString(),
    });

    const stripe = await getStripe();

    if (stripe) {
      if (response.id === undefined || response.id === null) {
        console.warn("response.id is undefined");
        return;
      }

      if (response.id === "noRefund") {
        changeRoleToUser.mutate({
          userId: props.id,
        });
        router.push(`/refund/noRefund`).catch((e) => {
          console.log(e);
        });
      } else {
        if (response.status === undefined || response.status === null) {
          console.log("response.status is null");
          return;
        }
        if (response.status) {
          setRefundResponse(response);
          router
            .push(`/refund/${response.id ? response.id : "noRefund"}`)
            .catch((e) => {
              console.log(e);
            });
        }
      }
    }
  };




  const isUserEnded = async (): Promise<void> => {
    if (today > props.endDate || today === props.endDate) {
      if (props.role === "SUBS") {
        await handleSubmit();
      }

      if (props.role === "MEM") {
        changeRoleToUser.mutate({
          userId: props.id,
        });
        addSessionToDB.mutate({
          userId: props.id,
          startDate: props.startDate,
          endDate: props.endDate,
        });
      }
    } else {
      toast.error("You have not reached the end date yet.");
    }
  };

  const toggleModal = () => {
    SetModalOpen(!isModalOpen);
  };

  return (
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    <div>
      <MakingSureModal
        open={isModalOpen}
        SetModalOpen={toggleModal}
        isUserEnded={isUserEnded}
        role={props.role}
      />
      <Toaster
        toastOptions={{
          className: "font-mono text-xl border-2 border-black ",
        }}
      />
      <button
        className="rounded-lg border-2 border-black bg-red-200 px-1 py-1
                  font-mono text-sm duration-200 hover:translate-x-1 hover:cursor-pointer hover:bg-red-400 
                  "
        onClick={() =>
          props.role === "USER"
            ? toast.error("You haven't set custom goal.")
            : SetModalOpen(!isModalOpen)
        }
      >
        end session/claim pledge &#128181;
      </button>
    </div>
  );
};

export default RefundButton;

interface OpenModalProps {
  open: boolean;
  SetModalOpen: () => void;
  isUserEnded: () => void;
  role: string;
}

const MakingSureModal = ({
  open,
  SetModalOpen,
  isUserEnded,
  role,
}: OpenModalProps) => {
  return (
    <>
      {open && (
        <div className="fixed bottom-0 left-0 right-0 top-0 z-40 flex items-center justify-center bg-gray-900 bg-opacity-50 font-mono ">
          <div className="z-50 max-w-3xl rounded-3xl border-2 border-black bg-[#fdfd96] p-8 text-lg">
            {role === "SUBS" ? (
              <div>
                <h2 className="mb-4 text-2xl font-bold">End The Session?</h2>
                <p>
                  All progresses will be displayed in the history section of
                  your profile.
                </p>
                <p className="mt-2">
                  Your pledge will be added back to your bank account within
                  5-10 days, in accordance with Stripe&apos;s policy.
                </p>
                <a href="https://support.stripe.com/questions/understanding-fees-for-refunded-payments">
                  <p
                    className="inline text-sm text-gray-400
              underline"
                  >
                    fees policy
                  </p>
                </a>
                <a href="https://support.stripe.com/questions/customer-refund-processing-time">
                  <p className="ml-5 inline text-sm text-gray-400 underline">
                    Refund processing time
                  </p>
                </a>
              </div>
            ) : (
              <div>
                <h2 className="mb-4 text-2xl font-bold">Summarize Session?</h2>
                <p className="mt-2">
                  Your session results and all records will be displayed in the
                  history section of your profile.
                </p>
              </div>
            )}

            <div className="flex flex-row space-x-5">
              <button
                className="mt-4 rounded border-2 border-black bg-white px-4 py-2 font-bold text-black shadow-neo hover:bg-red-300"
                onClick={() => isUserEnded()}
              >
                {role === "SUBS" ? "Refund/End Session" : "End session"}
              </button>
              <button
                className="mt-4 rounded border-2 border-black bg-white px-4 py-2 font-bold text-black shadow-neo hover:bg-blue-300"
                onClick={SetModalOpen}
              >
                Not now
              </button>
            </div>

            <footer className="mt-5">
              <div className="flex items-center justify-center">
                <p className="text-sm text-gray-400">© 2023 Motiflex</p>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};
