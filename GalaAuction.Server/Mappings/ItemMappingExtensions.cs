using GalaAuction.Server.DTOs;
using GalaAuction.Server.Models;

namespace GalaAuction.Server.Mappings
{
    public static class ItemMappingExtensions
    {
        public static ItemDto ToDto(this Item item)
        {
            return new ItemDto
            {
                ItemId = item.ItemId,
                ItemNumber = item.ItemNumber,
                ItemName = item.ItemName,
                WinningBidderNumber = item.WinningBidder?.BidderNumber,
                WinningBidderName = item.WinningBidder?.Guest.FullName ?? string.Empty,
                WinningBidAmount = item.WinningBidAmount,
                IsPaid = item.IsPaid,
                PaymentMethodId = item.PaymentMethodId,
                PaymentMethodName = item.PaymentMethod?.PaymentMethodName ?? string.Empty,
                GalaEventId = item.GalaEventId,
                CategoryId = item.CategoryId,
                CategoryName = item.Category?.CategoryName ?? string.Empty
            };
        }

        public static Item ToItem(this ItemImportDto dto)
        {
            var categoryId = dto.ItemNumber / 1000; // Assuming category is determined by the first digit(s) of the item number

            return new Item
            {
                ItemNumber = dto.ItemNumber, 
                ItemName = dto.ItemName,
                GalaEventId = dto.GalaEventId,
                CategoryId = categoryId,
                OpeningBid = dto.OpeningBid
            };
        }

        public static CheckoutItemDto ToCheckoutItemDto(this Item item)
        {
            return new CheckoutItemDto
            {
                ItemId = item.ItemId,
                ItemNumber = item.ItemNumber,
                ItemName = item.ItemName,
                WinningBidderNumber = item.WinningBidder?.BidderNumber,
                WinningBidAmount = item.WinningBidAmount,
                IsPaid = item.IsPaid
            };
        }

    }
}
