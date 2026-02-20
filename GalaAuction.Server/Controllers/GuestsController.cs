using CsvHelper;
using CsvHelper.Configuration;
using GalaAuction.Server.Data;
using GalaAuction.Server.DTOs;
using GalaAuction.Server.Mappings;
using GalaAuction.Server.Migrations;
using GalaAuction.Server.Models;
using GalaAuction.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace GalaAuction.Server.Controllers
{
    [Route("api/events/{eventId}/[controller]")]
    [ApiController]
    [Authorize]
    public class GuestsController(GalaAuctionDBContext context, EventService eventService, GuestService guestService) : ControllerBase, IAsyncActionFilter
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

        // GET: api/Guests
        [HttpGet]
        [Badge("New", color: "lightgreen")]
        public async Task<ActionResult<IEnumerable<GuestDto>>> GetGuests(int eventId)
        {
            var query = context.Guests.AsQueryable()
                    .Where(g => g.GalaEventId == GalaEvent!.GalaEventId)
                    .OrderBy(g => g.LastName)
                    .Include(g => g.Bidders)
                    .Select(g => g.ToDto());
            return await query.ToListAsync();
        }

        [HttpGet("downloadcsv")]
        public async Task<ActionResult> DownloadCsv(int eventId)
        {
            // Get the guest data to be exported as a CSV file
            var query = context.Guests.AsQueryable()
                    .Where(g => g.GalaEventId == GalaEvent!.GalaEventId)
                    .OrderBy(g => g.GuestId)
                    .Include(g => g.Bidders)
                    .Select(g => g.ToDto());
            var guests = await query.ToListAsync();

            // Create a custom configuration to include quoting string fields
            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                // Force the library to put quotes around string fields.
                ShouldQuote = args => args.FieldType == typeof(string)
            };

            // Create a memory stream to write the CSV data to, and use CsvHelper to write the data to the stream.
            using var memoryStream = new MemoryStream();
            using (var writer = new StreamWriter(memoryStream))
            using (var csv = new CsvWriter(writer, config))
            {
                csv.Context.RegisterClassMap<GuestExportMap>();
                csv.WriteRecords(guests);
                writer.Flush();
            }
            // Return the CSV file as a download, outputting the memory stream as a byte array.
            return File(memoryStream.ToArray(), "text/csv", $"guests_for_event_{eventId}.csv");
        }

        [HttpPost("uploadcsv")]
        public async Task<ActionResult> UploadGuestCsv(int eventId, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            try
            {
                using (var reader = new StreamReader(file.OpenReadStream(), Encoding.UTF8))
                using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture))
                {
                    csv.Context.RegisterClassMap<GuestImportMap>();
                    var guestsFromCsv = csv.GetRecords<GuestDto>().ToList();
                    foreach (var guestDto in guestsFromCsv)
                    {
                        // Ensure the GalaEventId from the URL is used as it will not be coming from the CSV
                        guestDto.GalaEventId = eventId;
                        // Create the Guest object from the DTO and add it to the context.
                        // The GuestService is used in the mapping to set the next available in person bidder number if one is not provided and OnlineBidderOnly is false.
                        var guest = guestDto.ToGuest(guestService);
                        context.Guests.Add(guest);
                    }
                    await context.SaveChangesAsync();
                    return Ok($"File uploaded and {guestsFromCsv.Count} guests imported successfully.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, $"An error occurred while processing the file: {ex.Message}");
            }
        }

        // GET: api/Guests/5
        [HttpGet("{id}")]
        public async Task<ActionResult<GuestDto>> GetGuest(int eventId, int id)
        {
            var query = context.Guests.AsQueryable()
                .Where(g => g.GalaEventId == eventId && g.GuestId == id)
                .Include(g => g.Bidders)
                .Select(g => g.ToDto());
            var guest = await query.SingleOrDefaultAsync();
            if (guest == null)
            {
                return NotFound();
            }
            return guest;
        }

        // PUT: api/Guests/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGuest(int eventId, int id, GuestDto dto)
        {
            if (id != dto.GuestId)
            {
                return BadRequest();
            }

            var guest = await context.Guests.Include(g => g.Bidders).SingleOrDefaultAsync(g => g.GuestId == id);
            if (guest == null)
            {
                return NotFound();
            }
            if (guest.GalaEventId != eventId)
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
        public async Task<ActionResult<Guest>> CreateGuest(int eventId, GuestDto dto)
        {
            if (dto.GalaEventId != eventId)
            {
                return BadRequest("Guest does not belong to the specified event.");
            }
            var guest = dto.ToGuest(guestService);
            // [TODO] Add code to make sure the BidderNumber is unique.  Perhaps a unique attribute on the BidderNumber in the Model.
            context.Guests.Add(guest);
            await context.SaveChangesAsync();

            return CreatedAtAction("GetGuest", new { eventId = guest.GalaEventId, id = guest.GuestId }, guest.ToDto());
        }

        // DELETE: api/Guests/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGuest(int eventId, int id)
        {
            var guest = await context.Guests.FindAsync(id);
            if (guest == null)
            {
                return NotFound();
            }
            if (guest.GalaEventId != eventId)
            {
                return BadRequest("Guest does not belong to the specified event.");
            }

            context.Guests.Remove(guest);
            await context.SaveChangesAsync();
            return NoContent();
        }

        private bool GuestExists(int id)
        {
            return context.Guests.Any(e => e.GuestId == id);
        }
    }
}
