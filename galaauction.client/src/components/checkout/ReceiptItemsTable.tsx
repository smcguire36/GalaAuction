import type { CheckoutDto } from "../../dto/CheckoutDto";
import { currencyFormatter } from "../../utilities/currencyFormatter";

const ReceiptItemsTable: React.FC<{ data: CheckoutDto }> = ({ data }) => {
  return (
    <div className="grow overflow-y-auto border-2 border-accent rounded-lg shadow-md my-2">
      <table className="table table-zebra table-pin-rows w-full border-collapse">
        <thead>
          <tr className="bg-accent flex flex-row w-full py-0">
            <th className="w-16 py-1 text-left shrink-0">Item #</th>
            <th className="flex-2 py-1 text-left min-w-0">Item Name</th>
            <th className="flex-1 py-1 text-right min-w-fit">Winning Bid</th>
          </tr>
        </thead>
        <tbody className="block h-96 max-h-96 overflow-y-auto">
          {data.itemsWon &&
            data.itemsWon.length > 0 &&
            data.itemsWon.map((item) => (
              <tr key={item.itemId} className="flex flex-row w-full py-0">
                <td className="w-16 text-left shrink-0 font-bold text-lg align-middle py-1">
                  {item.itemNumber}
                </td>
                <td className="flex-2 text-left min-w-0 align-middle py-1">{item.itemName}</td>
                <td className="flex-1 text-right min-w-fit align-middle py-1">
                  {currencyFormatter.format(item.winningBidAmount)}
                </td>
              </tr>
            ))}
        </tbody>
        <tfoot>
          <tr className="flex flex-row items-center w-full py-2 text-lg">
            <th className="w-20 py-1 text-left shrink-0 font-bold">
              <div>PAID BY</div>
            </th>
            <th className="flex-2 py-1 min-w-0"></th>
            <th className="flex-1 py-1 min-w-0 align-middle">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex flex-col text-base-content font-normal text-sm">
                  <p>{data.paymentMethodName}</p>
                  <p>{data.paymentDate
                    ? new Date(data.paymentDate).toLocaleDateString()
                    : "--"}</p>
                </div>
              </div>
            </th>
          </tr>
        </tfoot>
        <tfoot>
          <tr className="border-y-2 border-accent font-bold flex flex-row w-full py-0 text-lg">
            <th className="w-20 py-1 text-left shrink-0">TOTAL</th>
            <th className="flex-2 py-1 min-w-0"></th>
            <th className="flex-1 py-1 text-right min-w-fit">
              {data.totalOwed ? currencyFormatter.format(data.totalOwed) : "--"}
            </th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default ReceiptItemsTable;
