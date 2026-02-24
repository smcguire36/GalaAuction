using GalaAuction.Server.Data;
using GalaAuction.Server.Models;

namespace GalaAuction.Server.Services
{
    public class GuestService(GalaAuctionDBContext context)
    {
        public const int OnlineBidderNumberDefault = 1000;
        public const int InPersonBidderNumberDefault = 0;

        public int GetNextBidderNumber(int eventId, bool isOnline)
        {
            int maxId = isOnline ? OnlineBidderNumberDefault : InPersonBidderNumberDefault;
            try
            {
                maxId = context.Bidders
                    .Where(b => b.Guest.GalaEventId == eventId && b.IsOnline == isOnline)
                    .Select(b => b.BidderNumber)
                    .Max();
            }
            catch (Exception)
            {
                // Catch the error but do nothing as nextId has already been defaulted to 0.
            }
            return ++maxId;
        }

        public async Task<Guid> GetCheckoutLockAsync(Guest guest)
        {
            // Check to see if this bidder/guest is already locked for checkout
            if (guest.CheckoutLock != null)
            {
                TimeSpan diff = (TimeSpan)(DateTime.Now - guest.CheckoutLockedAt!);
                // If the lock is less than 10 minutes old, then return an error
                if (diff.Duration().TotalMinutes < 10)
                {
                    throw new Exception("Bidder is already locked for checkout");
                }
                // Otherwise, clear the old lock
                guest.CheckoutLock = null;
                guest.CheckoutLockedAt = null;
            }
            // Create new Lock
            var lockId = Guid.NewGuid();
            guest.CheckoutLock = lockId;
            guest.CheckoutLockedAt = DateTime.Now;
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
                    message = "No checkout lock found";
                }
                else
                {
                    TimeSpan diff = (TimeSpan)(DateTime.Now - guest.CheckoutLockedAt!);
                    // If the lock is less than 10 minutes old, then return an error
                    if (diff.Duration().TotalMinutes < 10)
                    {
                        message = "Bidder is locked for checkout by someone else";
                    }
                }
                return false;
            }
            return true;
        }

        public async void ClearCheckoutLockAsync(Guest guest, Guid lockToClear)
        {
            if (!ValidateCheckoutLock(guest, lockToClear, out string message))
            {
                throw new Exception(message);
            }
            guest.CheckoutLock = null;
            guest.CheckoutLockedAt = null;
            await context.SaveChangesAsync();
        }
    }
}
