using GalaAuction.Server.Data;

namespace GalaAuction.Server.Services
{
    public class GuestService(GalaAuctionDBContext context)
    {
        public string GetNextBidderNumber(int eventId)
        {
            Func<string, int?> stringToNullableInt = s =>
            {
                int temp;
                if (int.TryParse(s, out temp))
                { return temp; }
                return null;
            };

            var maxId = context.Bidders
                .Where(b => b.Guest.GalaEventId == eventId && b.IsOnline == false)
                .Select(b => stringToNullableInt(b.BidderNumber)) // Convert BidderNumbers to a nullable int
                .Where(b => b.HasValue)                           // Filter out any non-numeric BidderNumbers
                .Max() ?? 0;
            return (maxId + 1).ToString();
        }
    }
}
