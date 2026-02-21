using CsvHelper.Configuration;
using GalaAuction.Server.DTOs;
using GalaAuction.Server.Models;

namespace GalaAuction.Server.Mappings
{
    public class GuestImportMap : ClassMap<GuestDto>
    {
        public GuestImportMap()
        {
            Map(m => m.FirstName);
            Map(m => m.LastName);
            Map(m => m.TableNumber);
            Map(m => m.InPersonBidderNumber);
            Map(m => m.OnlineBidderNumber).Optional();
            Map(m => m.OnlineBidderOnly).Optional();
        }
    }
}
