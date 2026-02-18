using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace GalaAuction.Server.Models
{
    public class PaymentMethod
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public required string PaymentMethodId { get; set; }

        public required string PaymentMethodName { get; set; }

        // Navigation property for related Items
        [JsonIgnore]
        public List<Item> Items { get; set; } = new List<Item>();

    }
}
