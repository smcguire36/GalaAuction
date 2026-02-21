using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GalaAuction.Server.Data;
using GalaAuction.Server.Models;
using Microsoft.AspNetCore.Authorization;
using GalaAuction.Server.DTOs;
using GalaAuction.Server.Mappings;

namespace GalaAuction.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PaymentMethodsController(GalaAuctionDBContext context) : ControllerBase
    {
        // GET: api/PaymentMethods
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaymentMethodDto>>> GetPaymentMethods()
        {
            return await context.PaymentMethods.Select(pm => pm.ToDto()).ToListAsync();
        }

        // GET: api/PaymentMethods/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentMethodDto>> GetPaymentMethod(string id )
        {
            var paymentMethod = await context.PaymentMethods.AsQueryable()
                .Where(pm => pm.PaymentMethodId == id)
                .Select(pm => pm.ToDto())
                .SingleOrDefaultAsync();

            if (paymentMethod == null)
            {
                return NotFound();
            }

            return paymentMethod;
        }

        // PUT: api/PaymentMethods/test
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePaymentMethod(string id, PaymentMethodDto dto)
        {
            if (id != dto.PaymentMethodId)
            {
                return BadRequest();
            }

            var paymentMethod = await context.PaymentMethods.FindAsync(id);
            if (paymentMethod == null)
            {
                return NotFound();
            }

            paymentMethod.PaymentMethodId   = dto.PaymentMethodId;
            paymentMethod.PaymentMethodName = dto.PaymentMethodName;
            context.PaymentMethods.Update(paymentMethod);

            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PaymentMethodExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/PaymentMethods
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<PaymentMethodDto>> CreatePaymentMethod(PaymentMethodDto dto)
        {
            var paymentMethod = new PaymentMethod
            {
                PaymentMethodId   = dto.PaymentMethodId,
                PaymentMethodName = dto.PaymentMethodName
            };

            context.PaymentMethods.Add(paymentMethod);
            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (PaymentMethodExists(paymentMethod.PaymentMethodId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetPaymentMethod", new { id = paymentMethod.PaymentMethodId }, dto);
        }

        // DELETE: api/PaymentMethods/test
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePaymentMethod(string id)
        {
            var paymentMethod = await context.PaymentMethods.FindAsync(id);
            if (paymentMethod == null)
            {
                return NotFound();
            }

            context.PaymentMethods.Remove(paymentMethod);
            await context.SaveChangesAsync();

            return NoContent();
        }

        private bool PaymentMethodExists(string id)
        {
            return context.PaymentMethods.Any(e => e.PaymentMethodId == id);
        }
    }
}
