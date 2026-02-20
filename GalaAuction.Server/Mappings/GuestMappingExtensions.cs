using GalaAuction.Server.DTOs;
using GalaAuction.Server.Models;
using GalaAuction.Server.Services;

namespace GalaAuction.Server.Mappings
{
    public static class GuestMappingExtensions
    {
        public static GuestDto ToDto(this Guest guest)
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
                dto.OnlineBidderNumber = olBidder.BidderNumber;
            }
            return dto;
        }

        public static Guest ToGuest(this GuestDto dto, GuestService guestService)
        {
            // Create the Guest object and set properties from the DTO
            var guest = new Guest
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                GalaEventId = dto.GalaEventId,
                Bidders = new List<Bidder>()
            };
            // Set additional properties only if this is not an online only bidder
            if (dto.OnlineBidderOnly == false)
            {
                guest.TableNumber = dto.TableNumber;
            }
            // Create Bidder object and add to bidders list if OnlineBidderNumber is provided
            if (!string.IsNullOrEmpty(dto.OnlineBidderNumber))
            {
                guest.Bidders.Add(new Bidder
                {
                    BidderNumber = dto.OnlineBidderNumber,
                    IsOnline = true
                });
            }
            if (dto.OnlineBidderOnly == false)
            {
                // Create Bidder object and add to bidders list if InPersonBidderNumber is provided
                if (!string.IsNullOrEmpty(dto.InPersonBidderNumber))
                {
                    guest.Bidders.Add(new Bidder
                    {
                        BidderNumber = dto.InPersonBidderNumber,
                        IsOnline = false
                    });
                }
                // Get the next available in person bidder number if not provided and OnlineBidderOnly is false
                else
                {
                    guest.Bidders.Add(new Bidder
                    {
                        BidderNumber = guestService.GetNextBidderNumber(dto.GalaEventId),
                        IsOnline = false
                    });
                }
            }
            return guest;
        }
    }
}
