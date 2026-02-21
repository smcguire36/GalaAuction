using CsvHelper.Configuration;
using GalaAuction.Server.DTOs;
using GalaAuction.Server.Models;

namespace GalaAuction.Server.Mappings
{
    public class GuestExportMap : ClassMap<GuestDto>
    {
        public GuestExportMap()
        {
            Map(m => m.GuestId).Index(0);
            Map(m => m.FirstName).Index(1);
            Map(m => m.LastName).Index(2);
            Map(m => m.TableNumber).Index(3);
            Map(m => m.InPersonBidderNumber).Index(4);
            Map(m => m.OnlineBidderNumber).Index(5);
        }
    }
}
