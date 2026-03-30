import {
  use,
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
  guestId: number;
};

const CheckoutDialog = ({ ref, onConfirm, guestId }: CheckoutDialogProps) => {
  const { eventId } = use(EventContext);
  const { open, close } = use(ModalContext);
  const formRef = useRef<ModalFormHandle>(null);
  const [data, setData] = useState<CheckoutDto>(null as unknown as CheckoutDto);
  const { request } = useHttp();
  const [modalVariant, setModalVariant] = useState<"confirm" | "close">("confirm");

  const fetchGuestData = async () => {
    const guestData = await request(`/api/events/${eventId}/checkout/${guestId}`, "GET");
    setData(guestData);
  };

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        console.log("in open of CheckoutDialog, guestId:", guestId);
        // Fetch guest data based on guestId
        fetchGuestData();

        // Open modal after setting data
        open("checkoutGuest");
      },
    }),
    [fetchGuestData, guestId, open],
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
    return;

    try {
      const response = await request(
        `/api/events/${eventId}/checkout/${formData.guestId}`,
        "PUT",
        {
          galaEventId: eventId,
          guestId: formData.guestId,
        },
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
