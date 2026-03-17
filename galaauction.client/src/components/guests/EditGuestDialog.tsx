import {
  use,
  /* useEffect, */ useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";
import { ModalContext } from "../../store/ModalContext";
import { Modal, type ModalHandle } from "../common/Modal";
import EditGuestForm from "./EditGuestForm";
import {
  GUESTFORMDEFAULTS,
  type GuestFormData,
} from "../../types/GuestFormData";
import type { GuestType } from "../../types/Guest";
import type { ModalFormHandle } from "../../types/ModalFormHandle";
import { useHttp } from "../../hooks/useHttp";
import EventContext from "../../store/EventContext";

type EditGuestProps = {
  ref: Ref<ModalHandle>;
  onConfirm: () => void;
  guest: GuestType;
};

const normalizeGuestData = (guest: GuestType): GuestFormData => ({
  ...GUESTFORMDEFAULTS,
  ...guest,
  tableNumber: guest.tableNumber ?? null,
  inPersonBidderNumber: guest.inPersonBidderNumber ?? null,
  onlineBidderNumber: guest.onlineBidderNumber ?? null,
  onlineBidderOnly:
    guest.onlineBidderOnly ?? GUESTFORMDEFAULTS.onlineBidderOnly,
  inPersonAutoGen: guest.inPersonAutoGen ?? GUESTFORMDEFAULTS.inPersonAutoGen,
  onlineAutoGen: guest.onlineAutoGen ?? GUESTFORMDEFAULTS.onlineAutoGen,
});

const EditGuestDialog = ({ ref, onConfirm, guest }: EditGuestProps) => {
  const { eventId } = use(EventContext);
  const { open, close } = use(ModalContext);
  const formRef = useRef<ModalFormHandle>(null);
  const [data, setData] = useState<GuestFormData>(normalizeGuestData(guest));
  const { request, error } = useHttp();

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        console.log("in open of EditGuestDialog, guest:", guest);
        setData(normalizeGuestData(guest));

        // Open modal after setting data
        open("editGuest");
      },
    }),
    [guest, open],
  );

  const handleConfirm = () => {
    console.log("in handleConfirm in EditGuestDialog");
    formRef.current?.submit();
  };

  const onClose = () => {
    // What happens when the Edit Guest modal is closed
    console.log("onClose in EditGuestDialog");
  };

  const onSubmit = async (formData: GuestFormData) => {
    console.log("In onSubmit of EditGuestDialog", formData);
    // This is called once the form has determined that it is valid

    try {
      const response = await request(
        `/api/events/${eventId}/guests/${formData.guestId}`,
        "PUT",
        {
          guestId: formData.guestId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          tableNumber: formData.tableNumber,
          galaEventId: eventId,
          inPersonBidderNumber: formData.inPersonBidderNumber,
          onlineBidderNumber: formData.onlineBidderNumber,
          onlineBidderOnly: formData.onlineBidderOnly,
          inPersonAutoGen: formData.inPersonAutoGen,
          onlineAutoGen: formData.onlineAutoGen,
        },
      );

      console.log("Response from save guest", response);
      alert("Guest updated successfully!");
      onConfirm();
      close();
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
      id="editGuest"
      title="EDIT GUEST"
      customVariant="confirm"
      onClose={onClose}
      onConfirm={handleConfirm}
    >
      <EditGuestForm
        key={data.guestId}
        data={data}
        setData={setData}
        ref={formRef}
        onSubmit={onSubmit}
      />
    </Modal>
  );
};

export default EditGuestDialog;
