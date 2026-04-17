import { use, useImperativeHandle, useRef, useState, type Ref } from "react";
import { ModalContext } from "../../store/ModalContext";
import { Modal, type ModalHandle } from "../common/Modal";
import { useHttp } from "../../hooks/useHttp";
import EventContext from "../../store/EventContext";
import { type ModalFormHandle } from "../../types/ModalFormHandle";
import { GALAEVENTDEFAULTS, type GalaEventDto } from "../../dto/GalaEventDto";
import EditEventForm from "./EditEventForm";

type EditEventProps = {
  ref: Ref<ModalHandle>;
  onConfirm: () => void;
  galaEvent: GalaEventDto | null;
};

const EditEventDialog = ({ ref, onConfirm, galaEvent }: EditEventProps) => {
  const { open, close } = use(ModalContext);
  const formRef = useRef<ModalFormHandle>(null);
  const [data, setData] = useState<GalaEventDto>({...GALAEVENTDEFAULTS, ...galaEvent});
  const { request, error } = useHttp();

  useImperativeHandle(ref, () => ({
    open: () => {
      open("editEvent");
      console.log("Opening EditEventDialog with data:", data);
    },
  }));

  if (!galaEvent) {
    return <></>; // Or a loading spinner, or some placeholder content
  }

  /**
   * handleConfirm is called when the user clicks the confirm button on the modal. It triggers the form submission.
   */
  const handleConfirm = () => {
    formRef.current?.submit();
  };

  /**
   * onClose is called when the modal is closed. This can be used to reset any state or perform any cleanup necessary when the modal is closed.
   */
  const onClose = () => {
    // What happens when the Edit Event modal is closed
    console.log("onClose in EditEventDialog");
  };

  /**
   * onSubmit is called when the form is submitted and valid. It sends a POST request to the server to create a new guest with the provided form data.
   * If the request is successful, it calls the onConfirm callback and closes the modal. If there is an error, it displays an alert with the error message.
   * @param formData
   * @returns
   */
  const onSubmit = async (formData: GalaEventDto) => {
    console.log("In onSubmit of EditEventDialog", formData);
    // This is called once the form has determined that it is valid

    if (!galaEvent) {
      alert("No event selected. Cannot edit event.");
      return;
    }

    try {
      const response = await request(`/api/events/${galaEvent.galaEventId}`, "PUT", formData);

      console.log("Response from save event", response);
      onConfirm();
      close();
    } catch {
      alert(`Error editing event... ${error ?? "Unknown error"}`);
    }
  };

  return (
    <Modal
      id="editEvent"
      title="EDIT EVENT"
      customVariant="confirm"
      onClose={onClose}
      onConfirm={handleConfirm}
    >
      <EditEventForm
        data={data}
        setData={setData}
        ref={formRef}
        onSubmit={onSubmit}
      />
    </Modal>
  );
};

export default EditEventDialog;
