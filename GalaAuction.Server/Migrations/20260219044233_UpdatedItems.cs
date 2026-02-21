using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace GalaAuction.Server.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Item_Categories_CategoryId",
                table: "Item");

            migrationBuilder.AlterColumn<int>(
                name: "CategoryId",
                table: "Item",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ItemId",
                table: "Item",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<int>(
                name: "ItemNumber",
                table: "Item",
                type: "integer",
                nullable: false,
                defaultValue: 0);

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

            migrationBuilder.AddForeignKey(
                name: "FK_Item_Categories_CategoryId",
                table: "Item",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "CategoryId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Item_Categories_CategoryId",
                table: "Item");

            migrationBuilder.DeleteData(
                table: "Item",
                keyColumn: "ItemId",
                keyValue: -8);

            migrationBuilder.DeleteData(
                table: "Item",
                keyColumn: "ItemId",
                keyValue: -7);

            migrationBuilder.DeleteData(
                table: "Item",
                keyColumn: "ItemId",
                keyValue: -6);

            migrationBuilder.DeleteData(
                table: "Item",
                keyColumn: "ItemId",
                keyValue: -5);

            migrationBuilder.DeleteData(
                table: "Item",
                keyColumn: "ItemId",
                keyValue: -4);

            migrationBuilder.DeleteData(
                table: "Item",
                keyColumn: "ItemId",
                keyValue: -3);

            migrationBuilder.DeleteData(
                table: "Item",
                keyColumn: "ItemId",
                keyValue: -2);

            migrationBuilder.DeleteData(
                table: "Item",
                keyColumn: "ItemId",
                keyValue: -1);

            migrationBuilder.DropColumn(
                name: "ItemNumber",
                table: "Item");

            migrationBuilder.AlterColumn<int>(
                name: "CategoryId",
                table: "Item",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<int>(
                name: "ItemId",
                table: "Item",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddForeignKey(
                name: "FK_Item_Categories_CategoryId",
                table: "Item",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "CategoryId");
        }
    }
}
