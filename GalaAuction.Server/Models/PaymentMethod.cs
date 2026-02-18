using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GalaAuction.Server.Models
{
    public class PaymentMethod
    {
        [Key]
        public required string PaymentMethodId { get; set; }

        public required string PaymentMethodName { get; set; }

        // Navigation property for related Items
        [NotMapped]
        public List<Item> Items { get; set; } = new List<Item>();

    }
}
