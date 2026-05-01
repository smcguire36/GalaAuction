import type { GuestType } from "../../types/Guest";

const LabelTemplate: React.FC<{ guest: GuestType }> = ({ guest }) => {
  return (
    <>
      <div className="box-border flex h-[1in] w-[2.625in] flex-col items-center justify-center overflow-hidden pl-2 pr-8 mx-4 gap-2">
        <div className="font-serif text-lg">{guest.fullName}</div>
        <div className="flex w-full gap-2">
          <div className="flex-1 text-left">
            Table <span className="font-bold text-lg">{guest.tableNumber}</span>
          </div>
          <div className="flex-1 text-right">
            Bidder <span className="font-bold text-lg">{guest.inPersonBidderNumber}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default LabelTemplate;
