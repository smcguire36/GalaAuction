using GalaAuction.Server.Data;
using GalaAuction.Server.Models;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace GalaAuction.Server.Services
{
    public class EventService(GalaAuctionDBContext context)
    {
        public async Task<GalaEvent> GetEventById(int id)
        {
            var galaEvent = await context.GalaEvents.FindAsync(id);
            if (galaEvent != null)
            {
                return galaEvent;
            }
            else
            {
                throw new Exception("Event not found");
            }
        }
    }
}
