import { use, /* useEffect, */ useImperativeHandle, useRef, useState, type Ref } from "react";
import { ModalContext } from "../../store/ModalContext";
import { Modal, type ModalHandle } from "../common/Modal";
import EditGuestForm, { type EditGuestFormHandle } from "./EditGuestForm";
import { GUESTFORMDEFAULTS, type GuestFormData } from "../../types/GuestFormData";
import type { GuestType } from "../../types/Guest";

type EditGuestProps = {
  ref: Ref<ModalHandle>;
  onConfirm: () => void;
  guest: GuestType;
};


const EditGuestDialog = ({ ref, onConfirm, guest }: EditGuestProps) => {
  const { open, close } = use(ModalContext);
  const formRef = useRef<EditGuestFormHandle>(null);
  const [data, setData] = useState<GuestFormData>({
     ...GUESTFORMDEFAULTS,
     ...guest,
     
  });
 
  /*
  useEffect(() => {
    const getGuestData = async (id: number) => {

        // Eventually I will fetch the guest data from the server using the guestId


        setData((prev) => ({
          ...prev,
          guestId: id
        }));
      };
      if (guestId) {
        getGuestData(guestId);
      }
  }, [guestId]);
  */

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        console.log("in open of EditGuestDialog, guest:", guest);

        // Open modal after setting data
        open("editGuest");
      },
    }),
    [guest, open]
  );
 
  const handleConfirm = () => {
    console.log("in handleConfirm in EditGuestDialog");
    formRef.current?.submit();
  };

  const onClose = () => {
    // What happens when the Edit Guest modal is closed
    console.log("onClose in EditGuestDialog");
  };

  const onSubmit = (data: GuestFormData) => {
    console.log("In onSubmit of EditGuestDialog", data);
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
      id="editGuest"
      title="EDIT GUEST"
      customVariant="confirm"
      onClose={onClose}
      onConfirm={handleConfirm}
    >
      <EditGuestForm key={data.guestId} data={data} ref={formRef} onSubmit={onSubmit}/>
    </Modal>
  );
};

export default EditGuestDialog;
