using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace GalaAuction.Server.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
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
                    GalaEventId = table.Column<int>(type: "integer", nullable: false)
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
                name: "Bidder",
                columns: table => new
                {
                    BidderId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BidderNumber = table.Column<string>(type: "text", nullable: false),
                    IsOnline = table.Column<bool>(type: "boolean", nullable: false),
                    GuestId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bidder", x => x.BidderId);
                    table.ForeignKey(
                        name: "FK_Bidder_Guests_GuestId",
                        column: x => x.GuestId,
                        principalTable: "Guests",
                        principalColumn: "GuestId",
                        onDelete: ReferentialAction.Cascade);
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
                columns: new[] { "GalaEventId", "CreatedAt", "EventName", "EventStatus", "OrganizationName", "ThankYouMessage" },
                values: new object[] { 1, new DateTime(2026, 2, 15, 23, 0, 0, 0, DateTimeKind.Utc), "Gala 2026", "Setup", "Canticorum Virtuosi, Inc.", "Thank you for your support!" });

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
                columns: new[] { "GuestId", "FirstName", "GalaEventId", "LastName", "TableNumber" },
                values: new object[,]
                {
                    { -5, "Peggy", 1, "McGuire", 2 },
                    { -4, "Harold", 1, "Rosenbaum", 1 },
                    { -3, "Edie", 1, "Rosenbaum", 1 },
                    { -2, "Elisabeth", 1, "McDonald", 2 },
                    { -1, "Stewart", 1, "McGuire", 2 }
                });

            migrationBuilder.InsertData(
                table: "Bidder",
                columns: new[] { "BidderId", "BidderNumber", "GuestId", "IsOnline" },
                values: new object[,]
                {
                    { -8, "PM", -5, true },
                    { -7, "5", -5, false },
                    { -6, "4", -4, false },
                    { -5, "ER", -3, true },
                    { -4, "3", -3, false },
                    { -3, "ESM", -2, true },
                    { -2, "2", -2, false },
                    { -1, "1", -1, false }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bidder_GuestId",
                table: "Bidder",
                column: "GuestId");

            migrationBuilder.CreateIndex(
                name: "IX_Guests_GalaEventId",
                table: "Guests",
                column: "GalaEventId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bidder");

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
