using CsvHelper;
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
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace GalaAuction.Server.Controllers
{
    [Route("api/events/{eventId}/[controller]")]
    [ApiController]
    [Authorize]
    public class ItemsController(GalaAuctionDBContext context, EventService eventService, ItemService itemService) : ControllerBase, IAsyncActionFilter
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

        // GET: api/events/5/items
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ItemDto>>> GetItems(int eventId)
        {
            var query = context.Items.AsQueryable()
                .Where(i => i.GalaEventId == GalaEvent!.GalaEventId)
                .OrderBy(i => i.ItemNumber)
                .Include(i => i.PaymentMethod)
                .Include(i => i.Category)
                .Include(i => i.WinningBidder)
                .ThenInclude(b => b!.Guest)
                .Select(i => i.ToDto());
            return await query.ToListAsync();
        }

        // GET: api/events/5/items/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ItemDto>> GetItem(int eventId, int id)
        {
            var query = context.Items.AsQueryable()
                .Where(i => i.GalaEventId == GalaEvent!.GalaEventId && i.ItemId == id)
                .Include(i => i.PaymentMethod)
                .Include(i => i.Category)
                .Include(i => i.WinningBidder)
                .ThenInclude(b => b!.Guest)
                .Select(i => i.ToDto());
            var item = await query.SingleOrDefaultAsync();
            if (item == null)
            {
                return NotFound();
            }
            return item;
        }

        // GET: api/events/5/items/closeout
        [HttpGet("closeout")]
        public async Task<ActionResult<IEnumerable<ItemDto>>> GetCloseoutItems(int eventId)
        {
            var query = context.Items.AsQueryable()
                .Where(i => i.GalaEventId == GalaEvent!.GalaEventId)
                .Include(i => i.Category)
                .Include(i => i.PaymentMethod)
                .Include(i => i.WinningBidder)
                .ThenInclude(b => b!.Guest)
                .OrderBy(i => i.CategoryId)
                .ThenBy(i => i.ItemNumber)
                .Select(i => i.ToDto());
            var items = await query.ToListAsync();
            if (items == null)
            {
                return NotFound();
            }
            return items;
        }
            
        [HttpPatch("{id}/closeout")]
        public async Task<ActionResult> UpdateItemCloseout(int eventId, int id, ItemCloseoutDto dto)
        {
            if (id != dto.ItemId)
            {
                return BadRequest();
            }
            var item = await context.Items.SingleOrDefaultAsync(i => i.ItemId == id);
            if (item == null)
            {
                return NotFound();
            }
            if (item.GalaEventId != GalaEvent!.GalaEventId)
            {
                return BadRequest("Item does not belong to the specified event.");
            }
            if (!eventService.ValidateEventStatus(GalaEvent, EventStatus.Closeout))
            {
                return ValidationProblem("Event must be in closeout");
            }
            // Update the specific data included in this patch
            item.WinningBidderNumber = dto.WinningBidderNumber;
            item.WinningBidAmount = dto.WinningBidAmount;

            context.Entry(item).State = EntityState.Modified;

            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ItemExists(id))
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

        // PUT: api/events/5/items/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateItem(int eventId, int id, ItemDto dto)
        {
            if (id != dto.ItemId)
            {
                return BadRequest();
            }

            var item = await context.Items.SingleOrDefaultAsync(i => i.ItemId == id);
            if (item == null)
            {
                return NotFound();
            }
            if (item.GalaEventId != GalaEvent!.GalaEventId)
            {
                return BadRequest("Item does not belong to the specified event.");
            }
            if (item.ItemNumber != dto.ItemNumber)
            {
                // If the item number is being changed, we need to validate that the new item number does not already exist for this event
                if (context.Items.Any(i => i.GalaEventId == GalaEvent!.GalaEventId && i.ItemNumber == dto.ItemNumber))
                {
                    return BadRequest("An item with this item number already exists for this event.");
                }
            }
            if (dto.ItemNumber == null)
            {
                return BadRequest("Item number is required.");
            }

            // [TODO] Consider using AutoMapper for this kind of mapping
            item.ItemNumber = (int)dto.ItemNumber;  // Item number is required, but just in case we want to allow it to be optional in the DTO in the future, we will fall back to the existing item number if it is not provided.
            item.ItemName = dto.ItemName;
            item.WinningBidderNumber = dto.WinningBidderNumber;
            item.WinningBidAmount = dto.WinningBidAmount;
            item.IsPaid = dto.IsPaid;
            item.PaymentMethodId = dto.PaymentMethodId;
            item.CategoryId = dto.CategoryId;

            context.Entry(item).State = EntityState.Modified;

            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ItemExists(id))
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

        // POST: api/Items
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Item>> CreateItem(int eventId, ItemDto dto)
        {
            var item = new Item
            {
                ItemNumber = 0,
                ItemName = dto.ItemName,
                GalaEventId = dto.GalaEventId,
                CategoryId = dto.CategoryId
            };
            if (dto.ItemNumberAutoGen)
            {
                item.ItemNumber = itemService.GetNextItemNumber(eventId, dto.CategoryId);
            }
            else if (dto.ItemNumber.HasValue)
            {
                item.ItemNumber = dto.ItemNumber!.Value;
            }
            context.Items.Add(item);
            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (ItemExists(item.ItemId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetItem", new { eventId = item.GalaEventId, id = item.ItemId }, item.ToDto());
        }

        [HttpPost("uploadcsv")]
        public async Task<ActionResult> UploadItemCsv(int eventId, IFormFile file)
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
                    csv.Context.RegisterClassMap<ItemImportMap>();
                    var itemsFromCsv = csv.GetRecords<ItemImportDto>().ToList();
                    // Loop over new items to validate item numbers
                    // 1. Item numbers cannot be duplicated in the CSV file
                    // 2. Item numbers cannot already exist in the database for the same event
                    var errors = new List<string>();    // Keep track of errors found in the CSV file to report back to the user
                    var dups = new List<int>();         // Keep track of item numbers that are duplicated in the CSV file
                    var exists = new List<int>();       // Keep track of item numbers that already exist in the database
                    foreach (var dto in itemsFromCsv)
                    {
                        // Does this item number appear more than once in the CSV file?
                        if (itemsFromCsv.Count(i => i.ItemNumber == dto.ItemNumber) > 1)
                        {
                            // Has this item number already been flagged as a duplicate? We only want to report it once.
                            if (!dups.Contains(dto.ItemNumber))
                            {
                                dups.Add(dto.ItemNumber);
                                errors.Add($"Duplicate item number {dto.ItemNumber} found in the CSV file.");
                            }
                        }
                        // Does this item number already exist in the database for this event?
                        if (context.Items.Any(i => i.GalaEventId == eventId && i.ItemNumber == dto.ItemNumber))
                        {
                            // Has this item number already been flagged as existing? We only want to report it once.
                            if (!exists.Contains(dto.ItemNumber))
                            {
                                exists.Add(dto.ItemNumber);
                                errors.Add($"Item number {dto.ItemNumber} already exists for this event.");
                            }
                        }
                    }
                    // If any errors were found, return a BadRequest with the list of errors.
                    if (errors.Any())
                    {
                        return BadRequest(errors);
                    }
                    // Now that we know the items are valid, loop over them and insert them into the database
                    foreach (var dto in itemsFromCsv)
                    {
                        // Ensure the GalaEventId from the URL is used as it will not be coming from the CSV
                        dto.GalaEventId = eventId;
                        // Figure out the category Id
                        int categoryId = dto.ItemNumber / 100;

                        // Create the Item object from the DTO and add it to the context.
                        var item = dto.ToItem();
                        item.CategoryId = categoryId;
                        context.Items.Add(item);
                    }
                    await context.SaveChangesAsync();
                    return Ok($"File uploaded and {itemsFromCsv.Count} items imported successfully.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError, $"An error occurred while processing the file: {ex.Message}\n{ex.StackTrace}");
            }
        }

        // DELETE: api/Items/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(int eventId, int id)
        {
            var item = await context.Item.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }
            if (item.GalaEventId != GalaEvent!.GalaEventId)
            {
                return BadRequest("Item does not belong to the specified event.");
            }

            context.Item.Remove(item);
            await context.SaveChangesAsync();

            return NoContent();
        }


        private bool ItemExists(int id)
        {
            return context.Item.Any(e => e.ItemId == id);
        }
    }
}
