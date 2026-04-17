import type { GuestType } from "../../types/Guest";

const LabelTemplate: React.FC<{ guest: GuestType }> = ({ guest }) => {
    return (
<>        
        <div className="box-border flex h-[1in] w-[2.625in] flex-row items-center justify-center overflow-hidden px-2 ml-4 gap-2">
            <div className="flex-none flex flex-col">
                <div className="text-lg font-bold text-center">Table</div>
                <div className="text-2xl font-bold text-center">{guest.tableNumber}</div>
            </div>
            <div className="flex-2 flex flex-col">
                <div className="wrap text-md mb-2">{guest.fullName}</div>
                <div className="text-md">Bidder # {guest.inPersonBidderNumber}</div>
            </div>
        </div>
</>
    );
};

export default LabelTemplate;