using GalaAuction.Server.Data;
using GalaAuction.Server.Models;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace GalaAuction.Server.Services
{
    public enum EventStatus
    {
        Setup = 0,
        Active = 1,
        Closeout = 2,
        Checkout = 3,
        Closed = 4
    };

    public class EventService(GalaAuctionDBContext context)
    {
        private static readonly string[] EventStatusText = [
            "Setup",
            "Active",
            "Closeout",
            "Checkout",
            "Closed"
        ];

        public string GetEventStatusText(int status)
        {
            return EventStatusText[status];
        }

        public bool ValidateEventStatus(GalaEvent? galaEvent, EventStatus status)
        {
            if (galaEvent == null) return false;
            if (galaEvent.EventStatus != (int)status)
            {
                return false;
            }
            return true;
        }

        public async Task<GalaEvent?> GetEventById(int id)
        {
            return await context.GalaEvents.FindAsync(id);
        }
    }
}
