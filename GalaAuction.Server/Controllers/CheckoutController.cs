using GalaAuction.Server.Data;
using GalaAuction.Server.DTOs;
using GalaAuction.Server.Mappings;
using GalaAuction.Server.Models;
using GalaAuction.Server.Services;
using Humanizer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace GalaAuction.Server.Controllers
{
    [Route("api/events/{eventId}/[controller]")]
    [ApiController]
    [Authorize]
    public class CheckoutController(
        GalaAuctionDBContext context, 
        EventService eventService, 
        GuestService guestService
    ) : ControllerBase, IAsyncActionFilter
    {
        public GalaEvent? GalaEvent { get; set; }

        [NonAction]
        public async Task OnActionExecutionAsync(
            ActionExecutingContext context,
            ActionExecutionDelegate next)
        {
            // Try to load the GalaEvent object into the property so that it can be used in the action methods.
            // This is needed to avoid having to load the GalaEvent in each action method.
            if (context.ActionArguments.TryGetValue("eventId", out var eventIdObj) && eventIdObj is int eventId)
            {
                GalaEvent = eventService.GetEventById(eventId).GetAwaiter().GetResult();
                if (GalaEvent == null)
                {
                    context.Result = BadRequest("Event not found");
                    return;
                }
            }
            else
            {
                context.Result = BadRequest("A valid Event Id is required");
                return;
            }
            await next();
            // Put any post action code here.
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CheckoutListDto>>> GetCheckoutList(int eventId)
        {
            var query = context.Guests.AsQueryable()
                    .Where(g => g.GalaEventId == GalaEvent!.GalaEventId)
                    .OrderBy(g => g.LastName)
                    .Include(g => g.Bidders)
                    .ThenInclude(b => b!.ItemsWon)
                    .Select(g => g.ToCheckoutListDto());
            return await query.ToListAsync();
        }

        // PATCH: api/events/5
        [HttpGet("start")]
        public async Task<IActionResult> StartCheckout(int eventId)
        {
            if (eventService.ValidateEventStatus(GalaEvent, EventStatus.Closeout))
            {
                return ValidationProblem("Event must be in Closeout to initiate Checkout");
            }

            GalaEvent!.EventStatus = (int)EventStatus.Checkout;
            context.GalaEvents.Update(GalaEvent);
            await context.SaveChangesAsync();

            return Ok("Event is now in Checkout");
        }


        // POST: api/events/5/checkout/claim-orchid
        [HttpPost("{guestId}/claim-orchid")]
        public async Task<ActionResult<ItemDto>> ClaimOrchid(int eventId, int guestId)
        {
            if (eventId != GalaEvent!.GalaEventId)
            {
                return BadRequest("Event Ids do not match");
            }
            if (!eventService.ValidateEventStatus(GalaEvent, EventStatus.Checkout))
            {
                return BadRequest("Orchids can only be claimed when the event is in Checkout");
            }
            try
            {
                var guest = await guestService.GetGuestAsync(eventId, guestId);
                var item = await context.Items.AsQueryable()
                    // No Winning Bidder and only the Orchid category items (9xx)
                    .Where(i => i.GalaEventId == eventId && i.WinningBidderId == null && i.CategoryId == 9)
                    .OrderBy(i => i.ItemNumber)
                    .FirstOrDefaultAsync();
                if (item == null)
                {
                    return NotFound("No Orchids are available for purchase.");
                }
                item.WinningBidderId = guest.Bidders[0].BidderId;
                item.WinningBidAmount = item.OpeningBid;
                await context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return NoContent(); 
        }

        [HttpGet("{guestId}")]
        public async Task<ActionResult<CheckoutDto>> GetGuestCheckout(int eventId, int guestId, [FromQuery] bool noLock=false)
        {
            if (!eventService.ValidateEventStatus(GalaEvent, EventStatus.Checkout))
            {
                return BadRequest("Guest checkout only available when the event is in Checkout");
            }

            var guest = await context.Guests.AsQueryable()
                                .Where(g => g.GalaEventId == GalaEvent!.GalaEventId && g.GuestId == guestId)
                                .Include(g => g.Bidders)
                                .ThenInclude(b => b!.ItemsWon)
                                .ThenInclude(i => i!.PaymentMethod)
                                .FirstOrDefaultAsync();

            if (guest == null)
            {
                return NotFound("Guest not found");
            }

            // Set a checkout lock on the guest
            var lockId = Guid.Empty;
            try
            {
                if (!noLock)
                {
                    lockId = await guestService.GetCheckoutLockAsync(guest);
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
            var dto = guest.ToCheckoutDto();
            return Ok(dto);
        }

        [HttpPut("{guestId}")]
        public async Task<ActionResult> SaveGuestCheckout(int eventId, int guestId, CheckoutPaymentDto dto)
        {
            var paymentDate = DateTime.UtcNow;  

            if (!eventService.ValidateEventStatus(GalaEvent, EventStatus.Checkout))
            {
                return BadRequest("Guest checkout only available when the event is in Checkout");
            }
            // Get the guest entity and verify that it was found
            var guest = await context.Guests.AsQueryable()
                .Where(g => g.GuestId == dto.GuestId)
                .Include(g => g.Bidders)
                .ThenInclude(b => b!.ItemsWon)
                .FirstOrDefaultAsync();
            if (guest == null)
            {
                return BadRequest("Guest not attending this event");
            }
            // Validate checkout lock
            if (!guestService.ValidateCheckoutLock(guest, dto.CheckoutLock, out string message))
            {
                return BadRequest(message);
            }
            // Get the list of items that are paid for and confirm the list matches the database
            var items = await context.Items.AsQueryable()
                .Where(i => dto.ItemsPaid.Contains(i.ItemId) && i.IsPaid == false)
                .ToListAsync();
            if (items == null || items.Count != dto.ItemsPaid.Length)
            {
                return BadRequest("Cannot find all the items listed as being paid");
            }
            // Verify the payment method
            var payment = await context.PaymentMethods.AsQueryable()
                .Where(pm => pm.PaymentMethodId == dto.PaymentMethodId)
                .FirstOrDefaultAsync();
            if (payment == null)
            {
                return BadRequest("Invalid payment method");
            }
            // Update the payment information (isPaid and PaymentMethod) on each item
            items.ForEach(item =>
            {
                item.IsPaid = true;
                item.PaymentMethodId = dto.PaymentMethodId;
                item.PaymentDate = paymentDate;
                context.Items.Update(item);
            });
            guestService.ClearCheckoutLock(guest, guest.CheckoutLock);
            await context.SaveChangesAsync();

            var newDto = guest.ToCheckoutDto();
            newDto.PaymentMethodId = payment.PaymentMethodId;
            newDto.PaymentMethodName = payment.PaymentMethodName;
            newDto.PaymentDate = paymentDate;

            return Ok(newDto);
        }


        [HttpPost("{guestId}/release-lock")]
        public async Task<ActionResult> ReleaseCheckoutLock(int eventId, int guestId, [FromBody] CheckoutLockDto dto)
        {
            // Validate event is in checkout
            if (!eventService.ValidateEventStatus(GalaEvent, EventStatus.Checkout))
            {
                return BadRequest("Bidder checkout only available when the event is in Checkout");
            }
            // Get the guest entity and verify that it was found
            var guest = await context.Guests.AsQueryable()
                .Where(g => g.GuestId == guestId && g.GalaEventId == eventId)
                .FirstOrDefaultAsync();
            if (guest == null)
            {
                return BadRequest("Guest not attending this event");
            }
            // Now try to clear the checkout lock
            try
            {
                await guestService.ClearCheckoutLockAsync(guest, dto.CheckoutLock);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }

            return NoContent();
        }
    }
}
