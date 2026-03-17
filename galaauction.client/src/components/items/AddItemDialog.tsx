import { use, useImperativeHandle, useRef, useState, type Ref } from "react";
import { ModalContext } from "../../store/ModalContext";
import { Modal, type ModalHandle } from "../common/Modal";
import { useHttp } from "../../hooks/useHttp";
import EventContext from "../../store/EventContext";
import type { ModalFormHandle } from "../../types/ModalFormHandle";
import { ITEMFORMDEFAULTS, type ItemFormData } from "../../types/ItemFormData";
import EditItemForm from "./EditItemForm";

type AddItemProps = {
  ref: Ref<ModalHandle>;
  onConfirm: () => void;
};

const AddItemDialog = ({ ref, onConfirm }: AddItemProps) => {
  const { eventId } = use(EventContext);
  const { open, close } = use(ModalContext);
  const formRef = useRef<ModalFormHandle>(null);
  const [data, setData] = useState<ItemFormData>(ITEMFORMDEFAULTS);
  const { request, error } = useHttp();
  
  useImperativeHandle(ref, () => ({
    open: () => {
      open("addItem");
    }
  }));
 
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
    // What happens when the Add Item modal is closed
    console.log("onClose in AddItemDialog");
  };

  /**
   * onSubmit is called when the form is submitted and valid. It sends a POST request to the server to create a new item with the provided form data. 
   * If the request is successful, it calls the onConfirm callback and closes the modal. If there is an error, it displays an alert with the error message.
   * @param formData 
   * @returns 
   */
  const onSubmit = async (formData: ItemFormData) => {
    console.log("In onSubmit of AddItemDialog", formData);
    // This is called once the form has determined that it is valid

    if (!eventId) {
      alert("No event selected. Cannot add item.");
      return;
    }

    try {
      const response = await request(`/api/events/${eventId}/items`, "POST", {
        itemNumber: formData.itemNumber,
        itemName: formData.itemName,
        /*
        winningBidderNumber: formData.winningBidderNumber,
        winningBidderName: formData.winningBidderName,
        winningBidAmount: formData.winningBidAmount,
        isPaid: formData.isPaid,
        paymentMethodId: formData.paymentMethodId,
        paymentMethodName: formData.paymentMethodName,
        */
        categoryId: formData.categoryId,
        categoryName: formData.categoryName,
        itemNumberAutoGen: formData.itemNumberAutoGen,
        galaEventId: eventId,
      });

      console.log("Response from save item", response);
      alert("Item added successfully!");
      onConfirm();
      close();
    } catch {
      alert(`Error adding item... ${error ?? "Unknown error"}`);
    }
  };

  return (
    <Modal
      id="addItem"
      title="ADD NEW AUCTION ITEM"
      customVariant="confirm"
      onClose={onClose}
      onConfirm={handleConfirm}
    >
      <EditItemForm data={data} setData={setData} ref={formRef} onSubmit={onSubmit}/>
    </Modal>
  );
};

export default AddItemDialog;
