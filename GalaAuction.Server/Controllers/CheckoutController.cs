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
        public async Task<ActionResult<IEnumerable<CheckoutDto>>> GetCheckoutList(int eventId)
        {
            var query = context.Guests.AsQueryable()
                    .Where(g => g.GalaEventId == GalaEvent!.GalaEventId)
                    .OrderBy(g => g.LastName)
                    .Include(g => g.Bidders)
                    .ThenInclude(b => b!.ItemsWon)
                    .Select(g => g.ToCheckoutDto());
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
        [HttpPost("claim-orchid")]
        public async Task<ActionResult<ItemDto>> ClaimOrchid(int eventId, ClaimOrchidDto dto)
        {
            if (dto.GalaEventId != GalaEvent!.GalaEventId)
            {
                return BadRequest("Event Ids do not match");
            }
            if (eventService.ValidateEventStatus(GalaEvent, EventStatus.Checkout))
            {
                return BadRequest("Orchids can only be claimed when the event is in Checkout");
            }

            var item = await context.Items.AsQueryable()
                // No Winning Bidder and only the Orchid category items (9xx)
                .Where(i => i.GalaEventId == eventId && i.WinningBidderNumber == null && i.CategoryId == 9)
                .OrderBy(i => i.ItemNumber)
                .FirstOrDefaultAsync();
            if (item == null)
            {
                return NotFound("No Orchids are available for purchase.");
            }
            item.WinningBidderNumber = dto.BidderNumber;
            item.WinningBidAmount = item.OpeningBid;
            await context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("{guestId}")]
        public async Task<ActionResult<CheckoutDto>> GetCheckoutForBidder(int eventId, int guestId)
        {
            if (eventService.ValidateEventStatus(GalaEvent, EventStatus.Checkout))
            {
                return BadRequest("Bidder checkout only available when the event is in Checkout");
            }

            var guest = await context.Guests.AsQueryable()
                                .Where(g => g.GalaEventId == GalaEvent!.GalaEventId && g.GuestId == guestId)
                                .Include(g => g.Bidders)
                                .ThenInclude(b => b!.ItemsWon)
                                .FirstOrDefaultAsync();

            if (guest == null)
            {
                return NotFound("Guest not found");
            }
            var dto = guest.ToCheckoutDto();
            return Ok(dto);
        }

        [HttpPost("{bidderNumber}")]
        public async Task<ActionResult> SaveCheckoutForBidder(int eventId, int bidderNumber, CheckoutPaymentDto dto)
        {
            // Get the guest entity and verify that it was found
            var guest = await context.Guests.AsQueryable()
                .Where(g => g.GuestId == dto.GuestId)
                .FirstOrDefaultAsync();
            if (guest == null)
            {
                return BadRequest("Guest not attending given event");
            }
            // Validate checkout lock
            if (!guestService.ValidateCheckoutLock(guest, dto.CheckoutLockId, out string message))
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
            // Update the payment information (isPaid and PaymentMethod) on each item
            items.ForEach(item =>
            {
                item.IsPaid = true;
                item.PaymentMethodId = dto.PaymentMethodId;
                context.Items.Update(item);
            });
            await context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("lock")]
        public async Task<ActionResult<Guid>> GetCheckoutLock(int eventId, int bidderNumber)
        {
            // Validate event is in checkout
            if (eventService.ValidateEventStatus(GalaEvent, EventStatus.Checkout))
            {
                return BadRequest("Bidder checkout only available when the event is in Checkout");
            }
            // Get the bidder entity including the related Guest entity
            var bidder = await context.Bidders.AsQueryable()
                .Where(b => b.BidderNumber == bidderNumber && b.Guest.GalaEventId == eventId)
                .Include(b => b.Guest)
                .FirstOrDefaultAsync();
            if (bidder == null)
            {
                return NotFound("Bidder not found");
            }
            // Set and return a checkout lock on the guest
            var lockId = Guid.Empty;
            try
            {
                lockId = await guestService.GetCheckoutLockAsync(bidder.Guest);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
            return Ok(() => new { LockId = lockId });
        }
    }
}
