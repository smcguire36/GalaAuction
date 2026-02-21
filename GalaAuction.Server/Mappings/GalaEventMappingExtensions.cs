using GalaAuction.Server.DTOs;
using GalaAuction.Server.Models;

namespace GalaAuction.Server.Mappings
{
    public static class GalaEventMappingExtensions
    {
        public static EventDto ToDto(this GalaEvent galaEvent)
        {
            return new EventDto
            {
                GalaEventId = galaEvent.GalaEventId,
                EventName = galaEvent.EventName,
                EventDate = galaEvent.EventDate,
                OrganizationName = galaEvent.OrganizationName,
                ThankYouMessage = galaEvent.ThankYouMessage,
                EventStatus = galaEvent.EventStatus
            };
        }
    }
}
