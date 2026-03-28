import { use, useImperativeHandle, useRef, type Ref } from "react";
import { ModalContext } from "../../store/ModalContext";
import { Modal, type ModalHandle } from "../common/Modal";
import UploadCsvForm, { type UploadCsvData } from "../common/UploadCsvForm";
import EventContext from "../../store/EventContext";
import { useFileUpload } from "../../hooks/useFileUpload";
import type { ModalFormHandle } from "../../types/ModalFormHandle";

type UploadGuestsProps = {
  ref: Ref<ModalHandle>;
  onConfirm: () => void;
};

const UploadGuestsDialog = ({ ref, onConfirm }: UploadGuestsProps) => {
  const { eventId } = use(EventContext);
  const formRef = useRef<ModalFormHandle>(null);
  const { open, close } = use(ModalContext);
  const { uploadFile } = useFileUpload();

  useImperativeHandle(ref, () => ({
    open: () => {
      open("uploadGuests");
    },
  }));

  const handleConfirm = () => {
    // Trigger the form submission in UploadCsvForm when the confirm button is clicked
    formRef.current?.submit();
  };

  const handleClosed = () => {
    // What happens when the Upload Guests modal is closed
  };

  const onSubmit = async (formData: UploadCsvData) => {
    console.log("In onSubmit of UploadGuestsDialog", formData);

    try {
      const response = await uploadFile(
        `/api/events/${eventId}/guests/uploadcsv`,
        formData.uploadFile,
      );

      console.log("Response from upload guests", response);
      alert(response);
      onConfirm();
      close();
    } 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (err: any) {
      alert(`Error adding guest... ${err?.message ?? "Unknown error"}`);
    }
  };

  return (
    <Modal
      id="uploadGuests"
      title="UPLOAD GUESTS"
      customVariant="confirm"
      onClose={handleClosed}
      onConfirm={handleConfirm}
    >
      <UploadCsvForm
        label="Select CSV file containing guests"
        ref={formRef}
        onSubmit={onSubmit}
      />
    </Modal>
  );
};

export default UploadGuestsDialog;
