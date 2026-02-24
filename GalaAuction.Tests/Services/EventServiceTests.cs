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
    public class EventServiceTests : DbTestBase
    {
        [Test]
        public async Task GetEventById_ShouldReturnCorrectEvent()
        {
            // Arrange
            var eventService = new EventService(context);

            // Act
            var result = await eventService.GetEventById(1);

            // Assert (using Shouldly)
            result.ShouldBeOfType<GalaEvent>("Result is not a GalaEvent object.");
            result!.GalaEventId.ShouldBe(1, "GalaEventId does not match expected value.");
            result.EventName.ShouldBe("Gala 2026", "Gala EventName does not match expected value.");
        }
    }
}
