import { use, /* useEffect, */ useImperativeHandle, type Ref } from "react";
import { ModalContext } from "../../store/ModalContext";
import { Modal, type ModalHandle } from "../common/Modal";
import type { GuestType } from "../../types/Guest";
import EventContext from "../../store/EventContext";
import { useHttp } from "../../hooks/useHttp";

type DeleteGuestProps = {
  ref: Ref<ModalHandle>;
  onConfirm: () => void;
  guest: GuestType;
};

const DeleteGuestDialog = ({ ref, onConfirm, guest }: DeleteGuestProps) => {
  const { eventId } = use(EventContext);
  const { open, close } = use(ModalContext);
  const { request, error } = useHttp();
  
  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        console.log("in open of DeleteGuestDialog, guest:", guest);

        // Open modal after setting data
        open("deleteGuest");
      },
    }),
    [guest, open]
  );
 
  const handleConfirm = async () => {
    console.log("in handleConfirm in DeleteGuestDialog");

    if (!eventId) {
      alert("No event selected. Cannot add guest.");
      return;
    }

    try {
      const response = await request(`/api/events/${eventId}/guests/${guest.guestId}`, "DELETE");

      console.log("Delete response:", response);

      onConfirm();
      close();
    } catch {
      alert(`Error deleting guest... ${error ?? "Unknown error"}`);
    }    
    
    
    // Tell parent component the guest list has changed
    onConfirm();
    // Close the Modal
    close();
  };

  const onClose = () => {
    // What happens when the Delete Guest modal is closed
    console.log("onClose in DeleteGuestDialog");
  };

  return (
    <Modal
      id="deleteGuest"
      title="DELETE GUEST"
      customVariant="confirm"
      onClose={onClose}
      onConfirm={handleConfirm}
    >
      <div className="flex flex-row align-center gap-4">
        <p>Are you sure you want to delete {guest.firstName} {guest.lastName}?</p>
      </div>
    </Modal>
  );
};

export default DeleteGuestDialog;
