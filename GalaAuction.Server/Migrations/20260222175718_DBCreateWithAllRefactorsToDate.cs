using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace GalaAuction.Server.Migrations
{
    /// <inheritdoc />
    public partial class DBCreateWithAllRefactorsToDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    CategoryId = table.Column<int>(type: "integer", nullable: false),
                    CategoryName = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.CategoryId);
                });

            migrationBuilder.CreateTable(
                name: "GalaEvents",
                columns: table => new
                {
                    GalaEventId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EventName = table.Column<string>(type: "text", nullable: false),
                    EventDate = table.Column<DateOnly>(type: "date", nullable: true),
                    OrganizationName = table.Column<string>(type: "text", nullable: false),
                    ThankYouMessage = table.Column<string>(type: "text", nullable: false),
                    EventStatus = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GalaEvents", x => x.GalaEventId);
                });

            migrationBuilder.CreateTable(
                name: "PaymentMethods",
                columns: table => new
                {
                    PaymentMethodId = table.Column<string>(type: "text", nullable: false),
                    PaymentMethodName = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentMethods", x => x.PaymentMethodId);
                });

            migrationBuilder.CreateTable(
                name: "Guests",
                columns: table => new
                {
                    GuestId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    LastName = table.Column<string>(type: "text", nullable: false),
                    TableNumber = table.Column<int>(type: "integer", nullable: true),
                    GalaEventId = table.Column<int>(type: "integer", nullable: false),
                    OnlineBidderOnly = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Guests", x => x.GuestId);
                    table.ForeignKey(
                        name: "FK_Guests_GalaEvents_GalaEventId",
                        column: x => x.GalaEventId,
                        principalTable: "GalaEvents",
                        principalColumn: "GalaEventId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Bidders",
                columns: table => new
                {
                    BidderId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BidderNumber = table.Column<int>(type: "integer", nullable: false),
                    IsOnline = table.Column<bool>(type: "boolean", nullable: false),
                    GuestId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bidders", x => x.BidderId);
                    table.ForeignKey(
                        name: "FK_Bidders_Guests_GuestId",
                        column: x => x.GuestId,
                        principalTable: "Guests",
                        principalColumn: "GuestId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Item",
                columns: table => new
                {
                    ItemId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ItemNumber = table.Column<int>(type: "integer", nullable: false),
                    ItemName = table.Column<string>(type: "text", nullable: false),
                    WinningBidderNumber = table.Column<int>(type: "integer", nullable: true),
                    WinningBidAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    IsPaid = table.Column<bool>(type: "boolean", nullable: false),
                    PaymentMethodId = table.Column<string>(type: "text", nullable: true),
                    GalaEventId = table.Column<int>(type: "integer", nullable: false),
                    CategoryId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Item", x => x.ItemId);
                    table.ForeignKey(
                        name: "FK_Item_Bidders_WinningBidderNumber",
                        column: x => x.WinningBidderNumber,
                        principalTable: "Bidders",
                        principalColumn: "BidderId");
                    table.ForeignKey(
                        name: "FK_Item_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "CategoryId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Item_GalaEvents_GalaEventId",
                        column: x => x.GalaEventId,
                        principalTable: "GalaEvents",
                        principalColumn: "GalaEventId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Item_PaymentMethods_PaymentMethodId",
                        column: x => x.PaymentMethodId,
                        principalTable: "PaymentMethods",
                        principalColumn: "PaymentMethodId");
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "CategoryId", "CategoryName" },
                values: new object[,]
                {
                    { 2, "Getaways" },
                    { 3, "Alcohol" },
                    { 4, "Restaurants" },
                    { 5, "Events" },
                    { 6, "Sports" },
                    { 7, "Artwork" },
                    { 8, "Services" },
                    { 9, "Orchids" }
                });

            migrationBuilder.InsertData(
                table: "GalaEvents",
                columns: new[] { "GalaEventId", "CreatedAt", "EventDate", "EventName", "EventStatus", "OrganizationName", "ThankYouMessage" },
                values: new object[] { 1, new DateTime(2026, 2, 15, 23, 0, 0, 0, DateTimeKind.Utc), null, "Gala 2026", "Setup", "Canticorum Virtuosi, Inc.", "Thank you for your support!" });

            migrationBuilder.InsertData(
                table: "PaymentMethods",
                columns: new[] { "PaymentMethodId", "PaymentMethodName" },
                values: new object[,]
                {
                    { "AmEx", "American Express" },
                    { "Cash", "Cash" },
                    { "Chk", "Check" },
                    { "Disc", "Discover" },
                    { "MC", "Mastercard" },
                    { "Other", "Other" },
                    { "Visa", "Visa" }
                });

            migrationBuilder.InsertData(
                table: "Guests",
                columns: new[] { "GuestId", "FirstName", "GalaEventId", "LastName", "OnlineBidderOnly", "TableNumber" },
                values: new object[,]
                {
                    { -5, "Peggy", 1, "McGuire", false, 2 },
                    { -4, "Harold", 1, "Rosenbaum", false, 1 },
                    { -3, "Edie", 1, "Rosenbaum", false, 1 },
                    { -2, "Elisabeth", 1, "McDonald", false, 2 },
                    { -1, "Stewart", 1, "McGuire", false, 2 }
                });

            migrationBuilder.InsertData(
                table: "Item",
                columns: new[] { "ItemId", "CategoryId", "GalaEventId", "IsPaid", "ItemName", "ItemNumber", "PaymentMethodId", "WinningBidAmount", "WinningBidderNumber" },
                values: new object[,]
                {
                    { -8, 9, 1, false, "Orchid", 902, null, null, null },
                    { -7, 9, 1, false, "Orchid", 901, null, null, null },
                    { -6, 6, 1, false, "Yankee Tickets (4)", 602, null, null, null },
                    { -5, 6, 1, false, "Golf Outing", 601, null, null, null },
                    { -4, 3, 1, false, "Crate of Summer Wines", 303, null, null, null },
                    { -3, 3, 1, false, "Veuve Cliquot Champagne Brut, with flutes", 301, null, null, null },
                    { -2, 2, 1, false, "The Bunker Hill Inn", 202, null, null, null },
                    { -1, 2, 1, false, "Adirondack Get-away", 201, null, null, null }
                });

            migrationBuilder.InsertData(
                table: "Bidders",
                columns: new[] { "BidderId", "BidderNumber", "GuestId", "IsOnline" },
                values: new object[,]
                {
                    { -8, 1003, -5, true },
                    { -7, 5, -5, false },
                    { -6, 4, -4, false },
                    { -5, 1002, -3, true },
                    { -4, 3, -3, false },
                    { -3, 1001, -2, true },
                    { -2, 2, -2, false },
                    { -1, 1, -1, false }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bidders_GuestId",
                table: "Bidders",
                column: "GuestId");

            migrationBuilder.CreateIndex(
                name: "IX_Guests_GalaEventId",
                table: "Guests",
                column: "GalaEventId");

            migrationBuilder.CreateIndex(
                name: "IX_Item_CategoryId",
                table: "Item",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Item_GalaEventId",
                table: "Item",
                column: "GalaEventId");

            migrationBuilder.CreateIndex(
                name: "IX_Item_PaymentMethodId",
                table: "Item",
                column: "PaymentMethodId");

            migrationBuilder.CreateIndex(
                name: "IX_Item_WinningBidderNumber",
                table: "Item",
                column: "WinningBidderNumber");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Item");

            migrationBuilder.DropTable(
                name: "Bidders");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "PaymentMethods");

            migrationBuilder.DropTable(
                name: "Guests");

            migrationBuilder.DropTable(
                name: "GalaEvents");
        }
    }
}
