using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GalaAuction.Server.Data;
using GalaAuction.Server.Models;
using GalaAuction.Server.DTOs;
using GalaAuction.Server.Mappings;
using Microsoft.AspNetCore.Authorization;
using Scalar.AspNetCore;

namespace GalaAuction.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EventsController(GalaAuctionDBContext context) : ControllerBase
    {

        // GET: api/GalaEvents
        [HttpGet]
        [Badge("New", color:"lightgreen")]
        public async Task<ActionResult<IEnumerable<EventDto>>> GetGalaEvents()
        {
            return await context.GalaEvents.Select(e => e.ToDto()).ToListAsync();
        }

        // GET: api/GalaEvents/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EventDto>> GetGalaEvent(int id)
        {
            var galaEvent = await context.GalaEvents.FindAsync(id);

            if (galaEvent == null)
            {
                return NotFound();
            }

            return galaEvent.ToDto();
        }

        // PUT: api/GalaEvents/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGalaEvent(int id, EventDto dto)
        {
            if (id != dto.GalaEventId)
            {
                return BadRequest();
            }
            var galaEvent = await context.GalaEvents.FindAsync(id);
            if (galaEvent == null)
            {
                return NotFound();
            }
            // Update the properties of the existing entity with the values from the DTO
            galaEvent.EventName = dto.EventName;
            galaEvent.EventDate = dto.EventDate;
            galaEvent.OrganizationName = dto.OrganizationName;
            galaEvent.ThankYouMessage = dto.ThankYouMessage;
            if (dto.EventStatus != null)
            {
                galaEvent.EventStatus = dto.EventStatus;
            }
            context.Entry(galaEvent).State = EntityState.Modified;

            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GalaEventExists(id))
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

        // POST: api/GalaEvents
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<EventDto>> CreateGalaEvent(EventDto dto)
        {
            var galaEvent = new GalaEvent
            {
                EventName = dto.EventName,
                EventDate = dto.EventDate,
                OrganizationName = dto.OrganizationName,
                ThankYouMessage = dto.ThankYouMessage,
                EventStatus = dto.EventStatus ?? "Setup"
            };
            context.GalaEvents.Add(galaEvent);
            await context.SaveChangesAsync();

            return CreatedAtAction("GetGalaEvent", new { id = galaEvent.GalaEventId }, galaEvent.ToDto() );
        }

        // DELETE: api/GalaEvents/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGalaEvent(int id)
        {
            var galaEvent = await context.GalaEvents.FindAsync(id);
            if (galaEvent == null)
            {
                return NotFound();
            }

            context.GalaEvents.Remove(galaEvent);
            await context.SaveChangesAsync();

            return NoContent();
        }

        private bool GalaEventExists(int id)
        {
            return context.GalaEvents.Any(e => e.GalaEventId == id);
        }
    }
}
