import { useImperativeHandle, useRef, useState, type Ref } from "react";
import type { ModalFormHandle } from "../../types/ModalFormHandle";
import { FloatingInput } from "../common/FloatingInput";
import type { CheckoutDto } from "../../dto/CheckoutDto";
import { currencyFormatter } from "../../utilities/currencyFormatter";
import type { CheckoutPaymentDto } from "../../dto/CheckoutPaymentDto";
import { parseRequiredInt } from "../../utilities/parseInteger";

type CheckoutFormProps = {
  ref: Ref<ModalFormHandle>;
  onSubmit: (data: CheckoutPaymentDto) => void;
  guestId?: number;
  data: CheckoutDto;
  setData: React.Dispatch<React.SetStateAction<CheckoutDto>>;
};

const TouchedDefaultState = {
  firstName: false,
  lastName: false,
  tableNumber: false,
  inPersonBidderNumber: false,
  onlineBidderNumber: false,
  inPersonAutoGen: false,
  onlineAutoGen: false,
};

const ValidDefaultState = {
  firstName: false,
  lastName: false,
  tableNumber: true, // Non-required, blank is valid
  inPersonBidderNumber: true, // Non-required, blank is valid
  onlineBidderNumber: true, // Non-required, blank is valid
  inPersonAutoGen: true,
  onlineAutoGen: true,
};

const CheckoutForm = ({
  ref,
  onSubmit,
  guestId,
  data,
  setData,
}: CheckoutFormProps) => {
  // State to track whether each field has been touched or not for validation styling purposes
  const [touched, setTouched] = useState(TouchedDefaultState);
  // State to track the validity of each field for validation styling purposes
  const [valid, setValid] = useState(ValidDefaultState);
  const formRef = useRef<HTMLFormElement>(null);

  useImperativeHandle(ref, () => ({
    submit: () => {
      console.log("in submit() handler inside CheckoutForm");
      formRef.current?.requestSubmit();
    },
  }));

  const handleAction = (formData: FormData) => {
    console.log("in handleAction of CheckoutForm, formData:", Object.fromEntries(formData));

    const data: CheckoutPaymentDto = {
      guestId: parseRequiredInt(formData.get("guestId")),
      galaEventId: parseRequiredInt(formData.get("galaEventId")),
      paymentMethodId: formData.get("paymentMethodId") as string,
      amountPaid: parseRequiredInt(formData.get("amountPaid")),
      itemsPaid: (formData.get("itemsPaid") as string).split(",").map(id => Number(id)),
      checkoutLock: formData.get("checkoutLock") as string
    }

    onSubmit(data);
  };

  return (
    <form className="flex flex-col gap-2" ref={formRef} action={handleAction}>
      <input type="hidden" name="guestId" value={data.guestId} />
      <input type="hidden" name="galaEventId" value={data.galaEventId} />
      <input type="hidden" name="amountPaid" value={data.totalOwed ?? 0} />
      <input type="hidden" name="itemsPaid" value={data.itemsWon?.map(i => i.itemId).join(",") ?? ""} />
      <input type="hidden" name="checkoutLock" value={0} />
      <div className="flex flex-row gap-2">
        <FloatingInput  
          className="flex-1 font-bold"
          type="text"
          label="Bidder Numbers"
          name="bidderNumbers"
          readOnly
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onFocus={(e) => e.target.blur()}
          value={`${data.inPersonBidderNumber ? data.inPersonBidderNumber : ""}${data.inPersonBidderNumber && data.onlineBidderNumber ? " / " : ""}${data.onlineBidderNumber ? data.onlineBidderNumber : ""}`}
        />
        <FloatingInput 
          className="flex-3 font-bold"
          type="text"
          label="Guest Name"
          name="fullName"
          readOnly
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onFocus={(e) => e.target.blur()}
          value={data.fullName}
        />
      </div>
      <div className="grow overflow-y-auto border-2 border-accent rounded-lg shadow-md my-2">
        <table className="table table-zebra table-pin-rows w-full border-collapse">
          <thead>
            <tr className="bg-accent text-white/50 flex flex-row w-full py-0">
              <th className="w-16 py-1 text-left shrink-0">Item #</th>
              <th className="flex-2 py-1 text-left min-w-0">Item Name</th>
              <th className="flex-1 py-1 text-left min-w-fit">Winning Amount ($)</th>
            </tr>
          </thead>
          <tbody className="block h-64 max-h-64 overflow-y-auto">
            {data.itemsWon && data.itemsWon.length > 0 && (
              data.itemsWon.map(item => (
                <tr key={item.itemId} className="flex flex-row w-full py-0">
                  <td className="w-16 text-left shrink-0">{item.itemNumber}</td>
                  <td className="flex-2 text-left min-w-0">{item.itemName}</td>
                  <td className="flex-1 text-left min-w-fit">{currencyFormatter.format(item.winningBidAmount)}</td> 
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="font-bold flex flex-row w-full py-2">
              <th className="w-16 py-1 text-left shrink-0 align-middle">PAID BY</th>
              <th className="flex-1 py-1 min-w-0 align-middle">
                <div className="flex flex-wrap gap-1 items-center">
                  <input type="radio" id="pm-cash" name="paymentMethodId" value="Cash" className="sr-only peer/cash validator" required onInvalid={(e) => e.preventDefault()}/>
                  <label htmlFor="pm-cash" className="flex-1 btn btn-sm peer-checked/cash:btn-primary cursor-pointer">CASH</label>

                  <input type="radio" id="pm-check" name="paymentMethodId" value="Chk" className="sr-only peer/check validator" onInvalid={(e) => e.preventDefault()}/>
                  <label htmlFor="pm-check" className="flex-1 btn btn-sm peer-checked/check:btn-primary cursor-pointer">CHECK</label>

                  <input type="radio" id="pm-mc" name="paymentMethodId" value="MC" className="sr-only peer/mc validator" onInvalid={(e) => e.preventDefault()}/>
                  <label htmlFor="pm-mc" className="flex-1 btn btn-sm peer-checked/mc:btn-primary cursor-pointer">MASTERCARD</label>

                  <input type="radio" id="pm-visa" name="paymentMethodId" value="Visa" className="sr-only peer/visa validator" onInvalid={(e) => e.preventDefault()}/>
                  <label htmlFor="pm-visa" className="flex-1 btn btn-sm peer-checked/visa:btn-primary cursor-pointer">VISA</label>

                  <input type="radio" id="pm-amex" name="paymentMethodId" value="AmEx" className="sr-only peer/amex validator" onInvalid={(e) => e.preventDefault()}/>
                  <label htmlFor="pm-amex" className="flex-1 btn btn-sm peer-checked/amex:btn-primary cursor-pointer">AMERICAN EXPRESS</label>

                  <input type="radio" id="pm-discover" name="paymentMethodId" value="Disc" className="sr-only peer/discover validator" onInvalid={(e) => e.preventDefault()}/>
                  <label htmlFor="pm-discover" className="flex-1 btn btn-sm peer-checked/discover:btn-primary cursor-pointer">DISCOVER</label>

                  <input type="radio" id="pm-other" name="paymentMethodId" value="Other" className="sr-only peer/other validator" onInvalid={(e) => e.preventDefault()}/>
                  <label htmlFor="pm-other" className="flex-1 btn btn-sm peer-checked/other:btn-primary cursor-pointer">OTHER</label>
                  <p className="validator-hint">Please select a payment method.</p>
                </div>
              </th>
            </tr>
          </tfoot>
          <tfoot>
            <tr className="border-y-2 border-accent font-bold flex flex-row w-full py-0">
              <th className="w-16 py-1 text-left shrink-0">TOTAL</th>
              <th className="flex-2 py-1 min-w-0"></th>
              <th className="flex-1 py-1 text-left min-w-fit">{data.totalOwed ? currencyFormatter.format(data.totalOwed) : "--"}</th>
            </tr>
          </tfoot>
          </table>
      </div>

    </form>
  );
};

export default CheckoutForm;
