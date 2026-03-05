using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GalaAuction.Server.Migrations
{
    /// <inheritdoc />
    public partial class GuestCheckoutColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "OpeningBid",
                table: "Item",
                type: "numeric(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CheckoutLock",
                table: "Guests",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CheckoutLockedAt",
                table: "Guests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Guests",
                keyColumn: "GuestId",
                keyValue: -5,
                columns: new[] { "CheckoutLock", "CheckoutLockedAt" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Guests",
                keyColumn: "GuestId",
                keyValue: -4,
                columns: new[] { "CheckoutLock", "CheckoutLockedAt" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Guests",
                keyColumn: "GuestId",
                keyValue: -3,
                columns: new[] { "CheckoutLock", "CheckoutLockedAt" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Guests",
                keyColumn: "GuestId",
                keyValue: -2,
                columns: new[] { "CheckoutLock", "CheckoutLockedAt" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Guests",
                keyColumn: "GuestId",
                keyValue: -1,
                columns: new[] { "CheckoutLock", "CheckoutLockedAt" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Item",
                keyColumn: "ItemId",
                keyValue: -8,
                column: "OpeningBid",
                value: null);

            migrationBuilder.UpdateData(
                table: "Item",
                keyColumn: "ItemId",
                keyValue: -7,
                column: "OpeningBid",
                value: null);

            migrationBuilder.UpdateData(
                table: "Item",
                keyColumn: "ItemId",
                keyValue: -6,
                column: "OpeningBid",
                value: null);

            migrationBuilder.UpdateData(
                table: "Item",
                keyColumn: "ItemId",
                keyValue: -5,
                column: "OpeningBid",
                value: null);

            migrationBuilder.UpdateData(
                table: "Item",
                keyColumn: "ItemId",
                keyValue: -4,
                column: "OpeningBid",
                value: null);

            migrationBuilder.UpdateData(
                table: "Item",
                keyColumn: "ItemId",
                keyValue: -3,
                column: "OpeningBid",
                value: null);

            migrationBuilder.UpdateData(
                table: "Item",
                keyColumn: "ItemId",
                keyValue: -2,
                column: "OpeningBid",
                value: null);

            migrationBuilder.UpdateData(
                table: "Item",
                keyColumn: "ItemId",
                keyValue: -1,
                column: "OpeningBid",
                value: null);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OpeningBid",
                table: "Item");

            migrationBuilder.DropColumn(
                name: "CheckoutLock",
                table: "Guests");

            migrationBuilder.DropColumn(
                name: "CheckoutLockedAt",
                table: "Guests");
        }
    }
}
