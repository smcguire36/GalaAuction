using GalaAuction.Server.DTOs;
using GalaAuction.Server.Models;
using GalaAuction.Server.Services;

namespace GalaAuction.Server.Mappings
{
    public static class BidderMappingExtensions
    {
        public static BidderDto ToDto(this Bidder bidder)
        {
            var dto = new BidderDto
            {
                BidderId = bidder.BidderId,
                BidderNumber = bidder.BidderNumber,
                IsOnline = bidder.IsOnline,
                FullName = bidder.Guest.FullName,
                FullNameReversed = bidder.Guest.FullNameReversed
            };
            return dto;
        }
    }
}
