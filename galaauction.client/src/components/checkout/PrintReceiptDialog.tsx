import {
  use,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "react";
import { ModalContext } from "../../store/ModalContext";
import { Modal, type ModalHandle } from "../common/Modal";
import type { ModalFormHandle } from "../../types/ModalFormHandle";
import { useHttp } from "../../hooks/useHttp";
import EventContext from "../../store/EventContext";
import type { CheckoutDto } from "../../dto/CheckoutDto";
import PrintIcon from "../common/icons/PrintIcon";
import { useReactToPrint } from "react-to-print";
import ReceiptTemplate from "./ReceiptTemplate";

type PrintReceiptDialogProps = {
  ref: Ref<ModalHandle>;
};

const EMPTY_CHECKOUT_DATA: CheckoutDto = { guestId: -1 } as CheckoutDto;

const PrintReceiptDialog = ({ ref }: PrintReceiptDialogProps) => {
  const { eventId } = use(EventContext);
  const { open, close } = use(ModalContext);
  const formRef = useRef<ModalFormHandle>(null);
  const [data, setData] = useState<CheckoutDto>(EMPTY_CHECKOUT_DATA);
  const { request } = useHttp();
  const contentRef = useRef(null);
  const handlePrint = useReactToPrint({ contentRef });


  useImperativeHandle(
    ref,
    () => ({
      open: async (id: number = 0) => {
        console.log("in open of CheckoutDialog, guestId:", id);
        setData(EMPTY_CHECKOUT_DATA);

        try {
          const guestData = await request(`/api/events/${eventId}/checkout/${id}?noLock=true`, "GET");
          setData(guestData as CheckoutDto);
          open("printReceipt");
        } 
        catch (err: unknown) {
          console.error("Unable to load checkout guest", err);
          alert("Unable to load guest data for printing receipt. Please try again.");
          close();
        }
      },
    }),
    [close, eventId, open, request],
  );

  const handleConfirm = () => {
    console.log("in handleConfirm in CheckoutDialog");
    formRef.current?.submit();
  };

  const buttons = (
    <>
      <button className="btn btn-outline"
        onClick={handlePrint}
      >
        PRINT RECEIPT
        <PrintIcon />
      </button>
    </>
  );

  return (
    <Modal
      className=""
      id="printReceipt"
      title="PRINT GUEST RECEIPT"
      customVariant="close"
      onClose={close}
      onConfirm={handleConfirm}
      extraButtons={buttons}
    >
      {/* Receipt content */}
      <div className="hidden print:block print:bg-white print:text-black">
        <div
          ref={contentRef}
          className="print:grid print:grid-cols-2 print:w-screen print:h-screen print:p-12 print:gap-24 print-landscape"
        >
          {/* Customer Copy */}
          <ReceiptTemplate data={data} />

          {/* Gala Staff Copy */}
          <ReceiptTemplate data={data} />
        </div>
      </div>
    </Modal>
  );
};

export default PrintReceiptDialog;
