import { use, useImperativeHandle, useRef, type Ref } from "react";
import { Modal, type ModalHandle } from "../common/Modal";
import SelectEvent from "./SelectEvent";
import { ModalContext } from "../../store/ModalContext";

type SelectEventDialogProps = {
  ref: Ref<ModalHandle>;
  onConfirm: () => void;
};

const SelectEventDialog: React.FC<SelectEventDialogProps> = ({
  ref,
  onConfirm,
}) => {
  const { open, close } = use(ModalContext);
  const formRef = useRef<HTMLFormElement|null>(null);

  useImperativeHandle(
    ref,
    () => ({
      open: () => open("selectEvent")
    }),
    [open],
  );

  return (
    <Modal
      className=""
      id="selectEvent"
      title="SELECT EVENT"
      customVariant="confirm"
      onClose={close}
      formRef={formRef}
    >
      <SelectEvent formRef={formRef} onSubmit={onConfirm} />
    </Modal>
  );
};

export default SelectEventDialog;
