import {
  use,
  useCallback,
  /* useEffect, */ useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";
import { ModalContext } from "../../store/ModalContext";
import { Modal, type ModalHandle } from "../common/Modal";
import type { ModalFormHandle } from "../../types/ModalFormHandle";
import { useHttp } from "../../hooks/useHttp";
import EventContext from "../../store/EventContext";
import CheckoutForm from "./CheckoutForm";
import type { CheckoutDto } from "../../dto/CheckoutDto";
import type { CheckoutPaymentDto } from "../../dto/CheckoutPaymentDto";
import AddIcon from "../common/icons/AddIcon";
import PrintIcon from "../common/icons/PrintIcon";

type CheckoutDialogProps = {
  ref: Ref<ModalHandle>;
  onConfirm: () => void;
  onPrintReceipt: (guestId: number) => void; // Optional callback for when the print receipt button is clicked
};

const EMPTY_CHECKOUT_DATA: CheckoutDto = { guestId: -1 } as CheckoutDto;

const CheckoutDialog = ({ ref, onConfirm, onPrintReceipt }: CheckoutDialogProps) => {
  const { eventId } = use(EventContext);
  const { open, close } = use(ModalContext);
  const formRef = useRef<HTMLFormElement>(null);
  const [data, setData] = useState<CheckoutDto>(EMPTY_CHECKOUT_DATA);
  const { request } = useHttp();
  const [modalVariant, setModalVariant] = useState<"confirm" | "close">("confirm");

  const loadGuestData = useCallback(async (guestId: number, noLock: boolean = false) => {
    try {
      const guestData = await request(`/api/events/${eventId}/checkout/${guestId}?noLock=${noLock}`, "GET");
      setData(guestData as CheckoutDto);
    } 
    catch (err: unknown) {  
      if (err instanceof Error && err.message === "Guest is already locked for checkout") {
        alert("This guest is currently being checked out by another user. Please try again later.");
      } 
      else {
        console.error("Unable to load checkout guest", err);
      } 
    }
  }, [eventId, request]);

  useImperativeHandle(
    ref,
    () => ({
      open: async (id: number = 0) => {
        console.log("in open of CheckoutDialog, guestId:", id);
        setModalVariant("confirm");
        setData(EMPTY_CHECKOUT_DATA);

        loadGuestData(id);
        open("checkoutGuest");
      },
    }),
    [loadGuestData, open],
  );

  const onClose = async () => {
    // What happens when the Checkout modal is closed
    console.log("onClose in CheckoutDialog");

    if (!data.isPaid) {
      // If the guest has not completed checkout, we want to release the lock on the guest so that they can be checked out 
      // again by themselves or another user in the future. If the guest has completed checkout, we can leave the lock in 
      // place since it will automatically expire after a set amount of time and it prevents any further changes to the 
      // guest's checkout data while we are processing their payment.
      await request(`/api/events/${eventId}/checkout/${data.guestId}/release-lock`, "POST", { checkoutLock: data.checkoutLock })
        .then(() => {
          console.log("Successfully released checkout lock for guest", data.guestId);
          close();
        })
        .catch((err) => {
          console.error("Error releasing checkout lock for guest", data.guestId, err);
          close(); // Close the modal even if we fail to release the lock to avoid trapping users in the modal
        });
    }
  };

  const onSubmit = async (formData: CheckoutPaymentDto) => {
    console.log("In onSubmit of CheckoutDialog", formData);
    // This is called once the form has determined that it is valid
    setModalVariant("close"); // Change to close variant to allow modal to be closed by user after successful submission

    try {
      const response = await request(
        `/api/events/${eventId}/checkout/${formData.guestId}`,
        "PUT",
        {
          guestId: formData.guestId,
          galaEventId: eventId,
          paymentMethodId: formData.paymentMethodId,
          amountPaid: formData.amountPaid,
          itemsPaid: formData.itemsPaid,
          checkoutLock: formData.checkoutLock
        } as CheckoutPaymentDto,
      );

      console.log("Response from save guest", response);
      setData(response as CheckoutDto); // Update the form with any changes from the server (updates isPaid, PaymentMethod, etc)
      onConfirm();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(`Error updating guest... ${err.message ?? "Unknown error"}`);
    }
  };

  const handlePrintReceipt = () => {
    console.log("handlePrintReceipt for guest:", data);
    onPrintReceipt(data.guestId);
    close(); // Close the checkout dialog when we open the print receipt dialog
  };

  const handleAddOrchid = async () => {
    const resp = await request(`/api/events/${eventId}/checkout/${data.guestId}/claim-orchid`, "POST", {});
    if (resp.ok === false) {
      alert(`Error adding orchid... ${resp.message ?? "Unknown error"}`);
      return; 
    }
    console.log("Adding orchid to " + data.fullName, resp);
    loadGuestData(data.guestId, true);
    onConfirm();
  };

  const buttons = (
    <>
      <button className="btn btn-ghost"
        onClick={handlePrintReceipt}
        disabled={modalVariant !== "close"}
      >
        PRINT RECEIPT
        <PrintIcon />
      </button>
      <button className="btn btn-ghost"
        onClick={handleAddOrchid}
        disabled={modalVariant === "close"}
      >
        ADD ORCHID
        <AddIcon />
      </button>
    </>
  );

  return (
    <Modal
      className="w-8/12 max-w-4xl"
      id="checkoutGuest"
      title="BIDDER PAYMENT"
      customVariant={modalVariant}
      onClose={onClose}
      extraButtons={buttons}
      formRef={formRef}
    >
      <CheckoutForm
        key={data.guestId}
        data={data}
        setData={setData}
        formRef={formRef}
        onSubmit={onSubmit}
      />
    </Modal>
  );
};

export default CheckoutDialog;
