import { use, useImperativeHandle, useRef, type Ref } from "react";
import { ModalContext } from "../../store/ModalContext";
import { Modal, type ModalHandle } from "../common/Modal";
import UploadCsvForm, { type UploadCsvData } from "../common/UploadCsvForm";
import EventContext from "../../store/EventContext";
import { useFileUpload } from "../../hooks/useFileUpload";
import type { ModalFormHandle } from "../../types/ModalFormHandle";

type UploadItemsProps = {
  ref: Ref<ModalHandle>;
  onConfirm: () => void;
};

const UploadItemsDialog = ({ ref, onConfirm }: UploadItemsProps) => {
  const { eventId } = use(EventContext);
  const formRef = useRef<ModalFormHandle>(null);
  const { open, close } = use(ModalContext);
  const { uploadFile } = useFileUpload();

  useImperativeHandle(ref, () => ({
    open: () => {
      open("uploadItems");
    },
  }));

  const handleConfirm = () => {
    // Trigger the form submission in UploadCsvForm when the confirm button is clicked
    formRef.current?.submit();
  };

  const handleClosed = () => {
    // What happens when the Upload Items modal is closed
  };

  const onSubmit = async (formData: UploadCsvData) => {
    console.log("In onSubmit of UploadItemsDialog", formData);

    try {
      const response = await uploadFile(
        `/api/events/${eventId}/items/uploadcsv`,
        formData.uploadFile,
      );

      console.log("Response from upload items", response);
      if (typeof response === "string") {
        alert(response);
        onConfirm();
        close();
      } 
      else if (response && typeof response === "object") {
//        alert(response);
        var errors = response.reduce((acc: string, curr: string) => acc + `${curr}\n`, "Errors found in CSV:\n\n");
        alert(errors);
      }
    } catch (err: any) {
      alert(`Error adding item... ${err?.message ?? "Unknown error"}`);
    }
  };

  return (
    <Modal
      id="uploadItems"
      title="UPLOAD ITEMS"
      customVariant="confirm"
      onClose={handleClosed}
      onConfirm={handleConfirm}
    >
      <UploadCsvForm
        label="Select CSV file containing items"
        ref={formRef}
        onSubmit={onSubmit}
      />
    </Modal>
  );
};

export default UploadItemsDialog;
