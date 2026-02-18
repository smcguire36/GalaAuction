using GalaAuction.Server.Data;
using GalaAuction.Server.DTOs;
using GalaAuction.Server.Mappings;
using GalaAuction.Server.Migrations;
using GalaAuction.Server.Models;
using GalaAuction.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace GalaAuction.Server.Controllers
{
    [Route("api/events/{eventId}/[controller]")]
    [ApiController]
    [Authorize]
    public class GuestsController(GalaAuctionDBContext context, EventService eventService) : ControllerBase 
    {
        // GET: api/Guests
        [HttpGet]
        [Badge("New")]
        public async Task<ActionResult<IEnumerable<GuestDto>>> GetGuests(int eventId)
        {
            try
            {
                var galaEvent = await eventService.GetEventById(eventId);
                var query = context.Guests.AsQueryable()
                    .Where(g => g.GalaEventId == galaEvent!.GalaEventId)
                    .OrderBy(g => g.LastName)
                    .Include(g => g.Bidders)
                    .Select(g => g.ToDto());
                return await query.ToListAsync();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        // GET: api/Guests/5
        [HttpGet("{id}")]
        public async Task<ActionResult<GuestDto>> GetGuest(int eventId, int id)
        {
            try
            {
                var galaEvent = await eventService.GetEventById(eventId);
                var query = context.Guests.AsQueryable()
                    .Where(g => g.GalaEventId == galaEvent!.GalaEventId && g.GuestId == id)
                    .Include(g => g.Bidders)
                    .Select(g => g.ToDto());
                var guest = await query.SingleOrDefaultAsync();
                if (guest == null)
                {
                    return NotFound();
                }
                return guest;
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        // PUT: api/Guests/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGuest(int eventId, int id, GuestDto dto)
        {
            var galaEvent = null as GalaEvent;
            try
            {
                galaEvent = await eventService.GetEventById(eventId);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }

            if (id != dto.GuestId)
            {
                return BadRequest();
            }

            var guest = await context.Guests.Include(g => g.Bidders).SingleOrDefaultAsync(g => g.GuestId == id);
            if (guest == null)
            {
                return NotFound();
            }
            if (guest.GalaEventId != galaEvent.GalaEventId)
            {
                return BadRequest("Guest does not belong to the specified event.");
            }

            guest.FirstName = dto.FirstName;
            guest.LastName = dto.LastName;
            guest.TableNumber = dto.TableNumber;
            if (dto.OnlineBidderNumber != null)
            {
                var bidder = guest.Bidders.SingleOrDefault(bidder => bidder.IsOnline);
                if (bidder != null)
                {
                    bidder.BidderNumber = dto.OnlineBidderNumber;
                }
                else
                {
                    guest.Bidders.Add(new Bidder
                    {
                        BidderNumber = dto.OnlineBidderNumber,
                        IsOnline = true
                    });
                }

            }
            if (dto.InPersonBidderNumber != null)
            {
                var bidder = guest.Bidders.SingleOrDefault(bidder => !bidder.IsOnline);
                if (bidder != null)
                {
                    bidder.BidderNumber = dto.InPersonBidderNumber;
                }
                else
                {
                    guest.Bidders.Add(new Bidder
                    {
                        BidderNumber = dto.InPersonBidderNumber,
                        IsOnline = false
                    });
                }
            }

            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GuestExists(id))
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

        // POST: api/Guests
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        // Create a new guest
        [HttpPost]
        public async Task<ActionResult<Guest>>CreateGuest(int eventId, GuestDto dto)
        {
            var galaEvent = null as GalaEvent;
            try
            {
                galaEvent = await eventService.GetEventById(eventId);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }

            var bidders = new List<Bidder>();

            // [TODO] Add code to make sure the BidderNumber is unique.  Perhaps a unique attribute on the BidderNumber in the Model.

            // Create Bidder object and add to bidders list if OnlineBidderNumber is provided
            if (dto.OnlineBidderNumber != null)
            {
                bidders.Add(new Bidder
                {
                    BidderNumber = dto.OnlineBidderNumber,
                    IsOnline = true,
                });
            }
            // Create Bidder object and add to bidders list if InPersonBidderNumber is provided
            if (dto.InPersonBidderNumber != null)
            {
                bidders.Add(new Bidder
                {
                    BidderNumber = dto.InPersonBidderNumber,
                    IsOnline = false
                });
            }
            // Create Guest object and associate with the provided eventId and bidders
            var guest = new Guest
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                GalaEventId = galaEvent.GalaEventId,
                TableNumber = dto.TableNumber,
                Bidders = bidders
            };
            context.Guests.Add(guest);
            await context.SaveChangesAsync();

            return CreatedAtAction("GetGuest", new { eventId = guest.GalaEventId, id = guest.GuestId }, guest.ToDto());
        }

        // DELETE: api/Guests/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGuest(int eventId, int id)
        {
            try
            {
                var galaEvent = await eventService.GetEventById(eventId);

                var guest = await context.Guests.FindAsync(id);
                if (guest == null)
                {
                    return NotFound();
                }
                if (guest.GalaEventId != galaEvent!.GalaEventId)
                {
                    return BadRequest("Guest does not belong to the specified event.");
                }

                context.Guests.Remove(guest);
                await context.SaveChangesAsync();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
            return NoContent();
        }

        private bool GuestExists(int id)
        {
            return context.Guests.Any(e => e.GuestId == id);
        }
    }
}
