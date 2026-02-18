using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace GalaAuction.Server.Models
{
    public class Category
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int CategoryId { get; set; }
        public required string CategoryName { get; set; }

        // Navigation property for related Bidders
        [JsonIgnore]
        public List<Item> Items { get; set; } = new List<Item>();
    }
}
