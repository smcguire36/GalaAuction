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
using Scalar.AspNetCore;
using GalaAuction.Server.DTOs;
using GalaAuction.Server.Mappings;

namespace GalaAuction.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CategoriesController(GalaAuctionDBContext context) : ControllerBase
    {
        // GET: api/Categories
        [HttpGet]
        [Badge(name:"New", color:"lightgreen")]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
        {
            return await context.Categories.Select(c => c.ToDto()).ToListAsync();
        }

        // GET: api/Categories/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetCategory(int id)
        {
            var category = await context.Categories.AsQueryable()
                .Where(c => c.CategoryId == id)
                .Select(c => c.ToDto()).SingleOrDefaultAsync();
            if (category == null)
            {
                return NotFound();
            }

            return category;
        }

        // PUT: api/Categories/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, CategoryDto dto)
        {
            if (id != dto.CategoryId)
            {
                return BadRequest();
            }

            var category = await context.Categories.FindAsync(id);
            if (category == null) {
                return NotFound();
            }

            category.CategoryName = dto.CategoryName;
            context.Categories.Update(category);

            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CategoryExists(id))
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

        // POST: api/Categories
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Category>> CreateCategory(CategoryDto dto)
        {
            var category = new Category
            {
                CategoryId = dto.CategoryId,
                CategoryName = dto.CategoryName
            };

            context.Categories.Add(category);
            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (CategoryExists(category.CategoryId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetCategory", new { id = category.CategoryId }, dto);
        }

        // DELETE: api/Categories/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            context.Categories.Remove(category);
            await context.SaveChangesAsync();

            return NoContent();
        }

        private bool CategoryExists(int id)
        {
            return context.Categories.Any(e => e.CategoryId == id);
        }
    }
}
