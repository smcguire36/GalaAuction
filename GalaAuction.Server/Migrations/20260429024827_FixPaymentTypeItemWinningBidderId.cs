using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace GalaAuction.Server.Migrations
{
    /// <inheritdoc />
    public partial class FixPaymentTypeItemWinningBidderId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Item_Bidders_WinningBidderNumber",
                table: "Item");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Bidders_BidderNumber",
                table: "Bidders");

            migrationBuilder.DeleteData(
                table: "Bidders",
                keyColumn: "BidderId",
                keyValue: -3);

            migrationBuilder.DeleteData(
                table: "Bidders",
                keyColumn: "BidderId",
                keyValue: -2);

            migrationBuilder.DeleteData(
                table: "Guests",
                keyColumn: "GuestId",
                keyValue: -2);

            migrationBuilder.RenameColumn(
                name: "WinningBidderNumber",
                table: "Item",
                newName: "WinningBidderId");

            migrationBuilder.RenameIndex(
                name: "IX_Item_WinningBidderNumber",
                table: "Item",
                newName: "IX_Item_WinningBidderId");

            migrationBuilder.AddColumn<string>(
                name: "PaymentType",
                table: "PaymentMethods",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "GalaEvents",
                keyColumn: "GalaEventId",
                keyValue: 1,
                columns: new[] { "EventName", "OrganizationName" },
                values: new object[] { "Test Auction", "My Test Organization" });

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "PaymentMethodId",
                keyValue: "AmEx",
                column: "PaymentType",
                value: "Credit Card");

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "PaymentMethodId",
                keyValue: "Cash",
                column: "PaymentType",
                value: "Cash");

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "PaymentMethodId",
                keyValue: "Chk",
                column: "PaymentType",
                value: "Check");

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "PaymentMethodId",
                keyValue: "Disc",
                column: "PaymentType",
                value: "Credit Card");

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "PaymentMethodId",
                keyValue: "MC",
                column: "PaymentType",
                value: "Credit Card");

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "PaymentMethodId",
                keyValue: "Other",
                column: "PaymentType",
                value: "Other");

            migrationBuilder.UpdateData(
                table: "PaymentMethods",
                keyColumn: "PaymentMethodId",
                keyValue: "Visa",
                column: "PaymentType",
                value: "Credit Card");

            migrationBuilder.AddForeignKey(
                name: "FK_Item_Bidders_WinningBidderId",
                table: "Item",
                column: "WinningBidderId",
                principalTable: "Bidders",
                principalColumn: "BidderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Item_Bidders_WinningBidderId",
                table: "Item");

            migrationBuilder.DropColumn(
                name: "PaymentType",
                table: "PaymentMethods");

            migrationBuilder.RenameColumn(
                name: "WinningBidderId",
                table: "Item",
                newName: "WinningBidderNumber");

            migrationBuilder.RenameIndex(
                name: "IX_Item_WinningBidderId",
                table: "Item",
                newName: "IX_Item_WinningBidderNumber");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Bidders_BidderNumber",
                table: "Bidders",
                column: "BidderNumber");

            migrationBuilder.UpdateData(
                table: "GalaEvents",
                keyColumn: "GalaEventId",
                keyValue: 1,
                columns: new[] { "EventName", "OrganizationName" },
                values: new object[] { "Gala 2026", "Canticorum Virtuosi, Inc." });

            migrationBuilder.InsertData(
                table: "Guests",
                columns: new[] { "GuestId", "CheckoutLock", "CheckoutLockedAt", "FirstName", "GalaEventId", "LastName", "OnlineBidderOnly", "TableNumber" },
                values: new object[] { -2, null, null, "Elisabeth", 1, "McDonald", false, 2 });

            migrationBuilder.InsertData(
                table: "Bidders",
                columns: new[] { "BidderId", "BidderNumber", "GuestId", "IsOnline" },
                values: new object[,]
                {
                    { -3, 1001, -2, true },
                    { -2, 2, -2, false }
                });

            migrationBuilder.AddForeignKey(
                name: "FK_Item_Bidders_WinningBidderNumber",
                table: "Item",
                column: "WinningBidderNumber",
                principalTable: "Bidders",
                principalColumn: "BidderNumber");
        }
    }
}
