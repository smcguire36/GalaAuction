import { use, useImperativeHandle, useRef, useState, type Ref } from "react";
import { ModalContext } from "../../store/ModalContext";
import { Modal, type ModalHandle } from "../common/Modal";
import { useHttp } from "../../hooks/useHttp";
import EventContext from "../../store/EventContext";
import type { ModalFormHandle } from "../../types/ModalFormHandle";
import { ITEMFORMDEFAULTS, type ItemFormData } from "../../types/ItemFormData";
import EditItemForm from "./EditItemForm";
import type { ItemType } from "../../types/Item";

type EditItemProps = {
  ref: Ref<ModalHandle>;
  onConfirm: () => void;
  item: ItemType;
};

const normalizeItemData = (item: ItemType): ItemFormData => ({
  ...ITEMFORMDEFAULTS,
  ...item,
  itemNumber: item.itemNumber ?? null,
  winningBidderNumber: item.winningBidderNumber ?? null,
  winningBidderName: item.winningBidderName ?? null,
  winningBidAmount: item.winningBidAmount ?? null,
  paymentMethodId: item.paymentMethodId ?? null,
  paymentMethodName: item.paymentMethodName ?? null,
  categoryId: item.categoryId ?? null,
  categoryName: item.categoryName ?? "",
  itemNumberAutoGen: item.itemNumber === null,
});

const EditItemDialog = ({ ref, onConfirm, item }: EditItemProps) => {
  const { eventId } = use(EventContext);
  const { open, close } = use(ModalContext);
  const formRef = useRef<ModalFormHandle>(null);
  const [data, setData] = useState<ItemFormData>(normalizeItemData(item));
  const { request, error } = useHttp();
  
  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        setData(normalizeItemData(item));
        open("editItem");
      },
    }),
    [item, open],
  );
 
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
    // What happens when the Edit Item modal is closed
    console.log("onClose in EditItemDialog");
  };

  /**
   * onSubmit is called when the form is submitted and valid. It sends a PUT request to the server to update an existing item with the provided form data. 
   * If the request is successful, it calls the onConfirm callback and closes the modal. If there is an error, it displays an alert with the error message.
   * @param formData 
   * @returns 
   */
  const onSubmit = async (formData: ItemFormData) => {
    console.log("In onSubmit of EditItemDialog", formData);
    // This is called once the form has determined that it is valid

    if (!eventId) {
      alert("No event selected. Cannot edit item.");
      return;
    }

    try {
      const response = await request(`/api/events/${eventId}/items/${formData.itemId}`, "PUT", {
        ...ITEMFORMDEFAULTS,
        ...data,
      });

      console.log("Response from save item", response);
      alert("Item updated successfully!");
      onConfirm();
      close();
    } catch (err: any) {
      alert(`Error updating item... ${err.message ?? "Unknown error"}`);
    }
  };

  return (
    <Modal
      id="editItem"
      title="EDIT AUCTION ITEM"
      customVariant="confirm"
      onClose={onClose}
      onConfirm={handleConfirm}
    >
      <EditItemForm
        key={data.itemId}
        data={data}
        setData={setData}
        ref={formRef}
        onSubmit={onSubmit}
      />
    </Modal>
  );
};

export default EditItemDialog;
