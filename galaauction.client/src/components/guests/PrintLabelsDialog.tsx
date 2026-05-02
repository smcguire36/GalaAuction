import {
  use,
  useImperativeHandle,
  useRef,
  type Ref,
} from "react";
import { ModalContext } from "../../store/ModalContext";
import { Modal, type ModalHandle } from "../common/Modal";
import type { ModalFormHandle } from "../../types/ModalFormHandle";
import EventContext from "../../store/EventContext";
import PrintIcon from "../common/icons/PrintIcon";
import { useReactToPrint } from "react-to-print";
import LabelTemplate from "./LabelTemplate";
import type { GuestType } from "../../types/Guest";

type PrintReceiptDialogProps = {
  ref: Ref<ModalHandle>;
  onConfirm: () => void;
  guests: GuestType[];
};

const PrintLabelsDialog = ({ ref, onConfirm, guests }: PrintReceiptDialogProps) => {
  const { eventId } = use(EventContext);
  const { open, close } = use(ModalContext);
  const formRef = useRef<ModalFormHandle>(null);
  const contentRef = useRef(null);
  const handlePrint = useReactToPrint({ contentRef });

  useImperativeHandle(
    ref,
    () => ({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      open: (id: number = 0) => {
        console.log("in open of PrintLabelsDialog");
        open("printLabels");
        handlePrint();
      },
    }),
    [close, eventId, open],
  );

  const handleConfirm = () => {
    console.log("in handleConfirm in PrintLabelsDialog");
    formRef.current?.submit();
  };

  const filteredGuests = guests.filter((guest) => guest.tableNumber !== null && guest.tableNumber !== undefined);
  const pageSize = 30;
  const pages: GuestType[][] = [];
  for (let i = 0; i < filteredGuests.length; i += pageSize) {
    pages.push(filteredGuests.slice(i, i + pageSize));
  }

  const buttons = (
    <>
      <button className="btn btn-outline"
        onClick={handlePrint}
      >
        PRINT LABELS
        <PrintIcon />
      </button>
    </>
  );

  return (<>
    {/* w-8/12 max-w-[8.5in] */}
    <Modal
      className=""
      id="printLabels"
      title="PRINT GUEST LABELS"
      customVariant="close"
      onClose={close}
      onConfirm={handleConfirm}
      extraButtons={buttons}
    >
      <div className="hidden print:bg-white print:text-black">
        <div
          ref={contentRef}
          className="print-portrait mx-auto w-fit print:m-0 print:w-[8.5in]"
        >
          {pages.map((pageGuests, pageIndex) => (
            <div
              key={pageIndex}
              className={`grid grid-cols-3 gap-4 print:mt-10 print:grid-cols-[repeat(3,2.625in)] print:auto-rows-[1in] print:gap-x-[0.125in] print:gap-y-0 print:px-[0.125in] print:py-[0.5in]${pageIndex < pages.length - 1 ? " print:break-after-page" : ""}`}
            >
              {pageGuests.map((guest) => (
                <LabelTemplate key={guest.guestId} guest={guest} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  </>);
};

export default PrintLabelsDialog;
