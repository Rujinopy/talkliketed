
interface ModalProps {
    open: boolean;
    toggleModal: () => void;
}

const RefundModal = ({open, toggleModal} : ModalProps) => {

    return (
        <>
        {open && (
          <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-40 font-mono ">
            <div className="bg-white p-8 rounded-3xl z-50 border-2 border-black">
              <h2 className="text-2xl font-bold mb-4">Refund Status</h2>
              <p>Your refund Status:</p>
              <p>Your money will be added back to your bank account within 5-10 days, in accordance with Stripe's policy.</p>
              <a href="https://support.stripe.com/questions/understanding-fees-for-refunded-payments">
                <a href="https://support.stripe.com/questions/customer-refund-processing-time"><p className="inline text-gray-400
              hover:underline">1.fees policy</p></a><p className="inline text-gray-400 hover:underline">2.customer refund processing time</p></a>
                <p>Thank you for using Motiflex!</p>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                onClick={toggleModal}
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
      );
      
    };

export default RefundModal;