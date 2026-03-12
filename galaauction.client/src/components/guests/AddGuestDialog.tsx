import { use, useImperativeHandle, useRef, useState, type Ref } from "react";
import { ModalContext } from "../../store/ModalContext";
import { Modal, type ModalHandle } from "../common/Modal";
import EditGuestForm, { type EditGuestFormHandle } from "./EditGuestForm";
import { GUESTFORMDEFAULTS, type GuestFormData } from "../../types/GuestFormData";
import { useHttp } from "../../hooks/useHttp";
import EventContext from "../../store/EventContext";

type AddGuestProps = {
  ref: Ref<ModalHandle>;
  onConfirm: () => void;
};


const AddGuestDialog = ({ ref, onConfirm }: AddGuestProps) => {
  const { eventId } = use(EventContext);
  const { open, close } = use(ModalContext);
  const formRef = useRef<EditGuestFormHandle>(null);
  const [data, setData] = useState<GuestFormData>(GUESTFORMDEFAULTS);
  const { request, error } = useHttp();
  
  useImperativeHandle(ref, () => ({
    open: () => {
      open("addGuest");
    }
  }));
 
  const handleConfirm = () => {
    console.log("in handleConfirm in AddGuestDialog");
    formRef.current?.submit();
  };

  const onClose = () => {
    // What happens when the Add Guest modal is closed
    console.log("onClose in AddGuestDialog");
  };

  const onSubmit = async (formData: GuestFormData) => {
    console.log("In onSubmit of AddGuestDialog", formData);
    // This is called once the form has determined that it is valid

    if (!eventId) {
      alert("No event selected. Cannot add guest.");
      return;
    }

    try {
      const response = await request(`/api/events/${eventId}/guests`, "POST", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        tableNumber: formData.tableNumber,
        galaEventId: eventId,
        inPersonBidderNumber: formData.inPersonBidderNumber,
        onlineBidderNumber: formData.onlineBidderNumber,
        onlineBidderOnly: formData.onlineBidderOnly,
        inPersonAutoGen: formData.inPersonAutoGen,
        onlineAutoGen: formData.onlineAutoGen,
      });

      console.log("Response from save guest", response);
      alert("Guest added successfully!");
      onConfirm();
      close();
    } catch {
      alert(`Error adding guest... ${error ?? "Unknown error"}`);
    }
  };

  return (
    <Modal
      id="addGuest"
      title="ADD NEW GUEST"
      customVariant="confirm"
      onClose={onClose}
      onConfirm={handleConfirm}
    >
      <EditGuestForm data={data} setData={setData} ref={formRef} onSubmit={onSubmit}/>
    </Modal>
  );
};

export default AddGuestDialog;
