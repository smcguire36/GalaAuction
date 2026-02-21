using GalaAuction.Server.Data;

namespace GalaAuction.Server.Services
{
    public class ItemService(GalaAuctionDBContext context)
    {
        public int GetNextItemNumber(int eventId, int categoryId)
        {
            var maxId = context.Items
                .Where(i => i.GalaEventId == eventId && i.CategoryId == categoryId)
                .Max(i => (int?)i.ItemNumber) ?? (categoryId * 100);
            return maxId + 1;
        }
    }
}
