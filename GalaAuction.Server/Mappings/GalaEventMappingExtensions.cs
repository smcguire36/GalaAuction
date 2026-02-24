using GalaAuction.Server.DTOs;
using GalaAuction.Server.Models;
using GalaAuction.Server.Services;

namespace GalaAuction.Server.Mappings
{
    public static class GalaEventMappingExtensions
    {
        public static EventDto ToDto(this GalaEvent galaEvent, EventService eventService)
        {
            return new EventDto
            {
                GalaEventId = galaEvent.GalaEventId,
                EventName = galaEvent.EventName,
                EventDate = galaEvent.EventDate,
                OrganizationName = galaEvent.OrganizationName,
                ThankYouMessage = galaEvent.ThankYouMessage,
                EventStatusId = galaEvent.EventStatus,
                EventStatusText = eventService.GetEventStatusText(galaEvent.EventStatus)
            };
        }
    }
}
