using GalaAuction.Server.Data;
using GalaAuction.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace GalaAuction.Server.Services
{
    public class GuestService(GalaAuctionDBContext context)
    {
        public const int OnlineBidderNumberDefault = 1000;
        public const int InPersonBidderNumberDefault = 0;

        public async Task<Guest> GetGuestAsync(int eventId, int guestId)
        {
            var guest = await context.Guests.AsQueryable()
                                .Where(g => g.GalaEventId == eventId && g.GuestId == guestId)
                                .Include(g => g.Bidders)
                                .ThenInclude(b => b!.ItemsWon)
                                .ThenInclude(i => i!.PaymentMethod)
                                .FirstOrDefaultAsync();
            if (guest == null)
            {
                throw new Exception("Guest Not Found");
            }
            return guest;
        }

        public int GetNextBidderNumber(int eventId, bool isOnline)
        {
            int defaultId = isOnline ? OnlineBidderNumberDefault : InPersonBidderNumberDefault;

            int? maxId = context.Bidders
                .Where(b => b.Guest.GalaEventId == eventId && b.IsOnline == isOnline)
                .Select(b => (int?)b.BidderNumber)
                .Max();

            return (maxId ?? defaultId) + 1;
        }

        public async Task<Guid> GetCheckoutLockAsync(Guest guest)
        {
            // Check to see if this bidder/guest is already locked for checkout
            if (guest.CheckoutLock != null)
            {
                TimeSpan diff = (TimeSpan)(DateTime.UtcNow - guest.CheckoutLockedAt!);
                // If the lock is less than 10 minutes old, then return an error
                if (diff.Duration().TotalMinutes < 10)
                {
                    throw new Exception("Guest is already locked for checkout");
                }
                // Otherwise, clear the old lock
                guest.CheckoutLock = null;
                guest.CheckoutLockedAt = null;
            }
            // Create new Lock
            var lockId = Guid.NewGuid();
            guest.CheckoutLock = lockId;
            guest.CheckoutLockedAt = DateTime.UtcNow;
            await context.SaveChangesAsync();

            return lockId;
        }

        public bool ValidateCheckoutLock(Guest guest, Guid lockId, out string message)
        {
            message = "";
            if (guest.CheckoutLock != lockId)
            {
                if (guest.CheckoutLock == null)
                {
                    message = "Guest is not locked for checkout";
                    return false;
                }
                else
                {
                    TimeSpan diff = (TimeSpan)(DateTime.Now - guest.CheckoutLockedAt!);
                    // If the lock is less than 10 minutes old, then return an error
                    if (diff.Duration().TotalMinutes < 10)
                    {
                        message = "Guest is locked for checkout by someone else";
                        return false;
                    }
                }
            }
            return true;
        }

        public async Task ClearCheckoutLockAsync(Guest guest, Guid? lockToClear)
        {
            if (lockToClear is not { } lockValue)
            {
                return;
            }
            if (!ValidateCheckoutLock(guest, lockValue, out string message))
            {
                throw new Exception(message);
            }
            guest.CheckoutLock = null;
            guest.CheckoutLockedAt = null;
            await context.SaveChangesAsync();
        }

        public void ClearCheckoutLock(Guest guest, Guid? lockToClear)
        {
            if (lockToClear is not { } lockValue)
            {
                return;
            }
            if (!ValidateCheckoutLock(guest, lockValue, out string message))
            {
                throw new Exception(message);
            }
            guest.CheckoutLock = null;
            guest.CheckoutLockedAt = null;
        }
    }
}
