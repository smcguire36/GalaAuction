using GalaAuction.Server.DTOs;
using GalaAuction.Server.Models;

namespace GalaAuction.Server.Services
{
    public class GuestService
    {
        public GuestDto GetGuestDto(Guest guest)
        {
            var dto = new GuestDto
            {
                GuestId = guest.GuestId,
                FirstName = guest.FirstName,
                LastName = guest.LastName,
                TableNumber = guest.TableNumber,
                GalaEventId = guest.GalaEventId
            };
            var ipBidder = guest.Bidders.FirstOrDefault(item => item.IsOnline == false);
            if (ipBidder != null)
            {
                dto.InPersonBidderNumber = ipBidder.BidderNumber;
            }
            var olBidder = guest.Bidders.FirstOrDefault(item => item.IsOnline == true);
            if (olBidder != null)
            {
                dto.InPersonBidderNumber = olBidder.BidderNumber;
            }

            return dto;
        }
    }
}
