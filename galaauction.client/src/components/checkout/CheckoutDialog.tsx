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
};

const EMPTY_CHECKOUT_DATA: CheckoutDto = { guestId: -1 } as CheckoutDto;

const CheckoutDialog = ({ ref, onConfirm }: CheckoutDialogProps) => {
  const { eventId } = use(EventContext);
  const { open, close } = use(ModalContext);
  const formRef = useRef<ModalFormHandle>(null);
  const [data, setData] = useState<CheckoutDto>(EMPTY_CHECKOUT_DATA);
  const { request } = useHttp();
  const [modalVariant, setModalVariant] = useState<"confirm" | "close">("confirm");


  useImperativeHandle(
    ref,
    () => ({
      open: async (id: number = 0) => {
        console.log("in open of CheckoutDialog, guestId:", id);
        setModalVariant("confirm");
        setData(EMPTY_CHECKOUT_DATA);

        try {
          const guestData = await request(`/api/events/${eventId}/checkout/${id}`, "GET");
          setData(guestData as CheckoutDto);
          open("checkoutGuest");
        } 
        catch (err: unknown) {
          if (err instanceof Error && err.message === "Guest is already locked for checkout") {
            alert("This guest is currently being checked out by another user. Please try again later.");
          }
          else {
            console.error("Unable to load checkout guest", err);
          }
        }
      },
    }),
    [eventId, open, request],
  );

  const handleConfirm = () => {
    console.log("in handleConfirm in CheckoutDialog");
    formRef.current?.submit();
  };

  const onClose = () => {
    // What happens when the Checkout modal is closed
    console.log("onClose in CheckoutDialog");
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
      onConfirm();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(`Error updating guest... ${err.message ?? "Unknown error"}`);
    }

    // Tell parent component the guest list has changed
    onConfirm();
  };

  const handlePrintReceipt = () => {
    console.log("handlePrintReceipt for guest:", data);
    alert("Printing receipt for " + data.fullName);
  };

  const handleAddOrchid = () => {
    alert("Adding orchid to " + data.fullName);
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
      onConfirm={handleConfirm}
      extraButtons={buttons}
    >
      <CheckoutForm
        key={data.guestId}
        data={data}
        setData={setData}
        ref={formRef}
        onSubmit={onSubmit}
      />
    </Modal>
  );
};

export default CheckoutDialog;
