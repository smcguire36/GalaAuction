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

type CheckoutDialogProps = {
  ref: Ref<ModalHandle>;
  onConfirm: () => void;
  guest: CheckoutDto;
};

const CheckoutDialog = ({ ref, onConfirm, guest }: CheckoutDialogProps) => {
  const { eventId } = use(EventContext);
  const { open, close } = use(ModalContext);
  const formRef = useRef<ModalFormHandle>(null);
  const [data, setData] = useState<CheckoutDto>(guest);
  const { request } = useHttp();

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        console.log("in open of CheckoutDialog, guest:", guest);
        setData(guest);

        // Open modal after setting data
        open("checkoutGuest");
      },
    }),
    [guest, open],
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
      alert("Guest updated successfully!");
      onConfirm();
      close();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(`Error updating guest... ${err.message ?? "Unknown error"}`);
    }

    // Tell parent component the guest list has changed
    onConfirm();
    // Close the Modal
    close();
  };

  return (
    <Modal
      className="w-8/12 max-w-4xl"
      id="checkoutGuest"
      title="BIDDER PAYMENT"
      customVariant="confirm"
      onClose={onClose}
      onConfirm={handleConfirm}
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
