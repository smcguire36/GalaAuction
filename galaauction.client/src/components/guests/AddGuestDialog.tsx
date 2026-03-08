import { use, useImperativeHandle, useRef, useState, type Ref } from "react";
import { ModalContext } from "../../store/ModalContext";
import { Modal, type ModalHandle } from "../common/Modal";
import EditGuestForm, { type EditGuestFormHandle } from "./EditGuestForm";
import { GUESTFORMDEFAULTS, type GuestFormData } from "../../types/GuestFormData";

type AddGuestProps = {
  ref: Ref<ModalHandle>;
  onConfirm: () => void;
};


const AddGuestDialog = ({ ref, onConfirm }: AddGuestProps) => {
  const { open, close } = use(ModalContext);
  const formRef = useRef<EditGuestFormHandle>(null);
  const [data, setData] = useState<GuestFormData>(GUESTFORMDEFAULTS);
  

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

  const onSubmit = (data: GuestFormData) => {
    console.log("In onSubmit of AddGuestDialog", data);
    // This is called once the form has determined that it is valid
    // I will save the data back to the state for now
    setData((prev) => ({
      ...prev,
      firstName: data.firstName,
      lastName: data.lastName,
      onlineBidderOnly: data.onlineBidderOnly
    }));

    // Tell parent component the guest list has changed
    onConfirm();
    // Close the Modal
    close();
  };

  return (
    <Modal
      id="addGuest"
      title="ADD NEW GUEST"
      customVariant="confirm"
      onClose={onClose}
      onConfirm={handleConfirm}
    >
      <EditGuestForm data={data} ref={formRef} onSubmit={onSubmit}/>
    </Modal>
  );
};

export default AddGuestDialog;
