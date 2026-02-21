using GalaAuction.Server.DTOs;
using GalaAuction.Server.Models;

namespace GalaAuction.Server.Mappings
{
    public static class PaymentMethodMappingExtensions
    {
        public static PaymentMethodDto ToDto(this PaymentMethod paymentMethod)
        {
            return new PaymentMethodDto
            {
                PaymentMethodId = paymentMethod.PaymentMethodId,
                PaymentMethodName = paymentMethod.PaymentMethodName
            };
        }
    }
}



