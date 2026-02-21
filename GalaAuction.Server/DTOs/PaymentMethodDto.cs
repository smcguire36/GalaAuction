using GalaAuction.Server.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.AspNetCore.Http.HttpResults;
namespace GalaAuction.Server.DTOs
{
    public class PaymentMethodDto
    {
        public required string PaymentMethodId { get; set; }
        public required string PaymentMethodName { get; set; } 
    }

}
