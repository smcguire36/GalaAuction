using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GalaAuction.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddedEventDateAndItemTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "EventDate",
                table: "GalaEvents",
                type: "date",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Item",
                columns: table => new
                {
                    ItemId = table.Column<int>(type: "integer", nullable: false),
                    ItemName = table.Column<string>(type: "text", nullable: false),
                    WinningBidderNumber = table.Column<int>(type: "integer", nullable: true),
                    WinningBidAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    IsPaid = table.Column<bool>(type: "boolean", nullable: false),
                    PaymentMethodId = table.Column<string>(type: "text", nullable: true),
                    GalaEventId = table.Column<int>(type: "integer", nullable: false),
                    CategoryId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Item", x => x.ItemId);
                    table.ForeignKey(
                        name: "FK_Item_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "CategoryId");
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

            migrationBuilder.UpdateData(
                table: "GalaEvents",
                keyColumn: "GalaEventId",
                keyValue: 1,
                column: "EventDate",
                value: null);

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Item");

            migrationBuilder.DropColumn(
                name: "EventDate",
                table: "GalaEvents");
        }
    }
}
