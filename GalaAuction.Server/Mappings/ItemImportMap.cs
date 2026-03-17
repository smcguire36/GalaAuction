using CsvHelper.Configuration;
using GalaAuction.Server.DTOs;

namespace GalaAuction.Server.Mappings
{
    public class ItemImportMap : ClassMap<ItemImportDto>
    {
        public ItemImportMap()
        {
            Map(m => m.ItemNumber);
            Map(m => m.ItemName);
            Map(m => m.GalaEventId).Ignore();
        }
    }
}
