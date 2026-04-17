import { useContext } from "react";
import type { CheckoutDto } from "../../dto/CheckoutDto";
import EventContext from "../../store/EventContext";
import ReceiptItemsTable from "./ReceiptItemsTable";

const ReceiptTemplate: React.FC<{ data: CheckoutDto }> = ({ data }) => {
  const context = useContext(EventContext);

  return (
    <div className="font-sanserif text-[10pt] leading-snug">
        <div className="text-center text-3xl font-bold mb-2">
            {context?.event?.organizationName}
        </div>
        <div className="text-center text-lg mb-2">
            {context?.event?.eventName}
        </div>
        <div className="text-center text-lg mb-8">
            {context?.event?.thankYouMessage}
        </div>
        <div className="flex flex-row gap-1 mb-4">
            <div className="flex flex-col gap-1">
                <div>Bidder Number</div>
                <div className="font-bold">{data.inPersonBidderNumber}{data.onlineBidderNumber ? ` / ${data.onlineBidderNumber}` : ""}</div>
            </div>
            <div className="divider divider-horizontal"></div>
            <div className="flex-2 flex flex-col">
                <div>Winning Bidder</div>
                <div className="font-bold">{data.fullName}</div>
            </div>
        </div>
        <ReceiptItemsTable data={data} />
    </div>
  );
};

export default ReceiptTemplate;
