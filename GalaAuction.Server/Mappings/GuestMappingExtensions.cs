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
                GalaEventId = guest.GalaEventId,
                FullName = guest.FullName,
                FullNameReversed = guest.FullNameReversed
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
            if (ipBidder == null && olBidder != null)
            {
                dto.OnlineBidderOnly = true;
            }
            return dto;
        }

        public static GuestExportDto ToExportDto(this Guest guest)
        {
            var dto = new GuestExportDto
            {
                FullName = guest.FullName,
                FirstName = guest.FirstName,
                LastName = guest.LastName,
                TableNumber = guest.TableNumber
            };
            var ipBidder = guest.Bidders.FirstOrDefault(item => item.IsOnline == false);
            if (ipBidder != null)
            {
                dto.BidderNumber = ipBidder.BidderNumber;
            }
            return dto;
        }

        public static CheckoutListDto ToCheckoutListDto(this Guest guest)
        {
            CheckoutItemDto[] itemsWon = [];
            var dto = new CheckoutListDto
            {
                GuestId = guest.GuestId,
                FullName = guest.FullName,
                GalaEventId = guest.GalaEventId,
            };
            var ipBidder = guest.Bidders.FirstOrDefault(item => item.IsOnline == false);
            if (ipBidder != null)
            {
                dto.InPersonBidderNumber = ipBidder.BidderNumber;
                var ipItems = ipBidder.ItemsWon.Select(i => i.ToCheckoutItemDto()).ToArray();
                itemsWon = itemsWon.Concat(ipItems).ToArray();
            }
            var olBidder = guest.Bidders.FirstOrDefault(item => item.IsOnline == true);
            if (olBidder != null)
            {
                dto.OnlineBidderNumber = olBidder.BidderNumber;
                var olItems = olBidder.ItemsWon.Select(i => i.ToCheckoutItemDto()).ToArray();
                itemsWon = itemsWon.Concat(olItems).ToArray();
            }
            dto.TotalItemsWon = itemsWon.Length;
            dto.TotalOwed = itemsWon.Sum(i => i.WinningBidAmount ?? 0);
            dto.IsPaid = itemsWon.Length > 0 && itemsWon.All(i => i.IsPaid);

            return dto;
        }

        public static CheckoutDto ToCheckoutDto(this Guest guest)
        {
            var dto = new CheckoutDto
            {
                GuestId = guest.GuestId,
                FullName = guest.FullName,
                GalaEventId = guest.GalaEventId,
                CheckoutLock = guest.CheckoutLock
            };
            var ipBidder = guest.Bidders.FirstOrDefault(item => item.IsOnline == false);
            if (ipBidder != null)
            {
                dto.InPersonBidderNumber = ipBidder.BidderNumber;
                var ipItems = ipBidder.ItemsWon.Select(i => i.ToCheckoutItemDto()).ToArray();
                dto.ItemsWon = dto.ItemsWon.Concat(ipItems).ToArray();
            }
            var olBidder = guest.Bidders.FirstOrDefault(item => item.IsOnline == true);
            if (olBidder != null)
            {
                dto.OnlineBidderNumber = olBidder.BidderNumber;
                var olItems = olBidder.ItemsWon.Select(i => i.ToCheckoutItemDto()).ToArray();
                dto.ItemsWon = dto.ItemsWon.Concat(olItems).ToArray();
            }
            dto.TotalItemsWon = dto.ItemsWon.Length;
            dto.TotalOwed = dto.ItemsWon.Sum(i => i.WinningBidAmount ?? 0);
            dto.IsPaid = dto.ItemsWon.Length > 0 && dto.ItemsWon.All(i => i.IsPaid);

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
            if (dto.OnlineBidderNumber != null)
            {
                guest.Bidders.Add(new Bidder
                {
                    BidderNumber = (int)dto.OnlineBidderNumber,
                    IsOnline = true
                });
            }
            else if (dto.OnlineAutoGen)
            {
                guest.Bidders.Add(new Bidder
                {
                    BidderNumber = guestService.GetNextBidderNumber(dto.GalaEventId, true),
                    IsOnline = true
                });
            }
            if (dto.OnlineBidderOnly == false)
            {
                // Create Bidder object and add to bidders list if InPersonBidderNumber is provided
                if (dto.InPersonBidderNumber != null)
                {
                    guest.Bidders.Add(new Bidder
                    {
                        BidderNumber = (int)dto.InPersonBidderNumber,
                        IsOnline = false
                    });
                }
                // Get the next available in person bidder number if not provided and OnlineBidderOnly is false
                else if (dto.InPersonAutoGen)
                {
                    guest.Bidders.Add(new Bidder
                    {
                        BidderNumber = guestService.GetNextBidderNumber(dto.GalaEventId, false),
                        IsOnline = false
                    });
                }
            }
            return guest;
        }
    }
}
