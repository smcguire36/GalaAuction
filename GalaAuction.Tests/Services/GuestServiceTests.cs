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
    public class GuestServiceTests : DbTestBase
    {
        [Test]
        public async Task GetNextBidderNumber_InPerson_ShouldReturnCorrectNumber()
        {
            // Arrange
            var guestService = new GuestService(context);

            // Act
            var result = guestService.GetNextBidderNumber(1, false);

            // Assert (using Shouldly)
            result.ShouldBeOfType<int>("Result is not an integer.");
            result.ShouldBe(6, "Next bidder number does not match expected value");
        }

        [Test]
        public async Task GetNextBidderNumber_InPerson_WithNoBidders_ShouldReturnOne()
        {
            // Arrange
            var guestService = new GuestService(context);

            // Act
            var result = guestService.GetNextBidderNumber(2, false);

            // Assert (using Shouldly)
            result.ShouldBeOfType<int>("Result is not an integer.");
            result.ShouldBe(1, "Next bidder number does not match expected value");
        }

        [Test]
        public async Task GetNextBidderNumber_Online_ShouldReturnCorrectNumber()
        {
            // Arrange
            var guestService = new GuestService(context);

            // Act
            var result = guestService.GetNextBidderNumber(1, true);

            // Assert (using Shouldly)
            result.ShouldBeOfType<int>("Result is not an integer.");
            result.ShouldBe(1004, "Next bidder number does not match expected value");
        }

        [Test]
        public async Task GetCheckoutLockAsyc_NoLockExists()
        {
            // Arrange
            var guestService = new GuestService(context);
            var guest = await context.Guests.AsQueryable()
                .Where(g => g.GuestId == -1)
                .FirstOrDefaultAsync();

            // Act
            context.Database.BeginTransaction();
            var result = await guestService.GetCheckoutLockAsync(guest!);
            context.Database.RollbackTransaction();

            // Assert
            result.ShouldBeOfType<Guid>("Result is not of type Guid");
        }

        [Test]
        public async Task GetCheckoutLockAsyc_LockExists()
        {
            // Arrange
            var guestService = new GuestService(context);
            var guest = await context.Guests.AsQueryable()
                .Where(g => g.GuestId == -1)
                .FirstOrDefaultAsync();

            // Act
            context.Database.BeginTransaction();
            // Set Lock
            var lockId = await guestService.GetCheckoutLockAsync(guest!);
            try
            {
                var result = await guestService.GetCheckoutLockAsync(guest!);
                Assert.Fail("Should have thrown an exception");
            }
            catch(Exception ex)
            {
                // Assert
                ex.ShouldBeOfType<Exception>("Exception was of an unexpected type");
                ex.Message.ShouldBe("Bidder is already locked for checkout");
            }
            context.Database.RollbackTransaction();
        }

        [Test]
        public async Task ValidateCheckoutLock_LockExists()
        {
            var message = "";

            // Arrange
            var guestService = new GuestService(context);
            var guest = await context.Guests.AsQueryable()
                .Where(g => g.GuestId == -1)
                .FirstOrDefaultAsync();
            var lockId = await guestService.GetCheckoutLockAsync(guest!);

            context.Database.BeginTransaction();

            // Act
            var result = guestService.ValidateCheckoutLock(guest!, lockId, out message);
            // Assert
            result.ShouldBeOfType<bool>("Should return a boolean");
            result.ShouldBeTrue("Should have returned true");
            message.ShouldBeEmpty("No message should be returned");

            lockId = Guid.NewGuid();
            result = guestService.ValidateCheckoutLock(guest!, lockId, out message);
            // Assert
            result.ShouldBeOfType<bool>("Should return a boolean");
            result.ShouldBeFalse("Should have returned false");
            message.ShouldBe("Bidder is locked for checkout by someone else");

            context.Database.RollbackTransaction();
        }

        [Test]
        public async Task ValidateCheckoutLock_NoLockExists()
        {
            var message = "";
            var lockId = Guid.NewGuid();

            // Arrange
            var guestService = new GuestService(context);
            var guest = await context.Guests.AsQueryable()
                .Where(g => g.GuestId == -1)
                .FirstOrDefaultAsync();

            context.Database.BeginTransaction();

            // Act
            var result = guestService.ValidateCheckoutLock(guest!, lockId, out message);
            // Assert
            result.ShouldBeOfType<bool>("Should return a boolean");
            result.ShouldBeFalse("Should have returned false");
            message.ShouldBe("No checkout lock found");

            context.Database.RollbackTransaction();
        }

    }
}
