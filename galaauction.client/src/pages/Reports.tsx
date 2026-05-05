import { useRef } from "react";
import TabNavigation from "../components/TabNavigation";
import AuctionSummaryReport from "../components/reports/AuctionSummaryReport";
import PrintIcon from "../components/common/icons/PrintIcon";
import { useReactToPrint } from "react-to-print";
import AuctionCloseoutReport from "../components/reports/AuctionCloseoutReport";
import ItemsDetailReport from "../components/reports/ItemsDetailReport";

const ReportsPage = () => {
  const summaryContentRef = useRef(null);
  const handlePrintSummary = useReactToPrint({ contentRef: summaryContentRef });
  const closeoutContentRef = useRef(null);
  const handlePrintCloseout = useReactToPrint({ contentRef: closeoutContentRef });
  const itemsDetailContentRef = useRef(null);
  const handlePrintItemsDetail = useReactToPrint({ contentRef: itemsDetailContentRef });

  return (
    <>
      <div className="flex flex-row">
        <div className="flex-initial align-middle">
          <TabNavigation />
        </div>
        <div className="flex-auto text-right align-middle">
          <div className="flex align-middle flex-row-reverse pt-3 gap-2"></div>
        </div>
      </div>
      <div className="grow overflow-y-auto border-2 border-accent rounded-lg shadow-md my-2">
        <div className="collapse bg-base-100 border border-base-300">
          <input type="radio" name="my-accordion-1" defaultChecked />
          <div className="collapse-title font-semibold">
            <div className="flex flex-row gap-2 items-center">
              <div>
                Auction Summary Report (Guests, Bidders, Items, etc.)
              </div>
              <div>
                <button className="btn btn-ghost relative z-10"
                  onClick={(e) => { e.stopPropagation(); handlePrintSummary(); }}
                >
                  <PrintIcon />
                </button>
              </div>
            </div>
          </div>
          <div className="collapse-content text-sm">
            <div ref={summaryContentRef}>
              <AuctionSummaryReport />
            </div>
          </div>
        </div>
        <div className="collapse bg-base-100 border border-base-300">
          <input type="radio" name="my-accordion-1" />
          <div className="collapse-title font-semibold">
            <div className="flex flex-row gap-2 items-center">
              <div>
                Auction Closeout Report
              </div>
              <div>
                <button className="btn btn-ghost relative z-10"
                  onClick={(e) => { e.stopPropagation(); handlePrintCloseout(); }}
                >
                  <PrintIcon />
                </button>
              </div>
            </div>
          </div>
          <div className="collapse-content text-sm">
            <div ref={closeoutContentRef}>
              <AuctionCloseoutReport />
            </div>
          </div>
        </div>
        <div className="collapse bg-base-100 border border-base-300">
          <input type="radio" name="my-accordion-1" />
          <div className="collapse-title font-semibold">
            <div className="flex flex-row gap-2 items-center">
              <div>
                Auction Items Detail Report
              </div>
              <div>
                <button className="btn btn-ghost relative z-10"
                  onClick={(e) => { e.stopPropagation(); handlePrintItemsDetail(); }}
                >
                  <PrintIcon />
                </button>
              </div>
            </div>
          </div>
          <div className="collapse-content text-sm">
            <div ref={itemsDetailContentRef}>
              <ItemsDetailReport />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportsPage;
