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
                WinningBidderNumber = item.WinningBidderNumber,
                WinningBidAmount = item.WinningBidAmount,
                isPaid = item.IsPaid,
                PaymentMethodId = item.PaymentMethodId,
                GalaEventId = item.GalaEventId,
                CategoryId = item.CategoryId
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
                CategoryId = categoryId
            };
        }

    }
}
