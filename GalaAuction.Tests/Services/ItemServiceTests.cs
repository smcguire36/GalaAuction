using System;
using System.Collections.Generic;
using System.Text;
using GalaAuction.Server.Data;
using GalaAuction.Server.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.Sqlite;
using Shouldly;
using GalaAuction.Server.Models;


namespace GalaAuction.Tests.Services
{
    public class ItemServiceTests : DbTestBase
    {
        [Test]
        public async Task GetNextItemNumber_ShouldReturnCorrectNumber()
        {
            // Arrange
            var service = new ItemService(context);
            var eventId = 1;
            var categoryId = 2;

            // Act
            var result = service.GetNextItemNumber(eventId, categoryId);

            // Assert (using Shouldly)
            result.ShouldBeOfType<int>("Result is not a GalaEvent object.");
            result.ShouldBe(203, "Item number does not match expected value.");
        }

        [Test]
        public async Task GetNextItemNumber_ShouldReturnFirstNumberWhenNoItems()
        {
            // Arrange
            var service = new ItemService(context);
            var eventId = 1;
            var categoryId = 4;

            // Act
            var result = service.GetNextItemNumber(eventId, categoryId);

            // Assert (using Shouldly)
            result.ShouldBeOfType<int>("Result is not a GalaEvent object.");
            result.ShouldBe(401, "Item number does not match expected value.");
        }
    }
}
