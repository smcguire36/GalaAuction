
import { use, useImperativeHandle, type Ref } from "react";
import { ModalContext } from "../../store/ModalContext";
import { Modal, type ModalHandle } from "../common/Modal";
import UploadGuestsForm from "./UploadGuestForm";

type UploadGuestsProps = {
  ref: Ref<ModalHandle>;
  onConfirm: () => void;
};

const UploadGuestsDialog = ({ ref, onConfirm }: UploadGuestsProps) => {
  const { open } = use(ModalContext);

  useImperativeHandle(ref, () => ({
    open: () => {
      open("addGuest");
    }
  }));
 
  const handleConfirm = () => {


    // Tell parent component the guest list has changed
    onConfirm();
  };

  const handleClosed = () => {
    // What happens when the Add Guest modal is closed
  };

  return (
    <Modal
      id="uploadGuests"
      title="UPLOAD GUESTS"
      customVariant="confirm"
      onClose={handleClosed}
      onConfirm={handleConfirm}
    >
      <UploadGuestsForm />
    </Modal>
  );
};

export default UploadGuestsDialog;