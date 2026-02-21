using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GalaAuction.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddedOnlineBidderOnly : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "OnlineBidderOnly",
                table: "Guests",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Guests",
                keyColumn: "GuestId",
                keyValue: -5,
                column: "OnlineBidderOnly",
                value: false);

            migrationBuilder.UpdateData(
                table: "Guests",
                keyColumn: "GuestId",
                keyValue: -4,
                column: "OnlineBidderOnly",
                value: false);

            migrationBuilder.UpdateData(
                table: "Guests",
                keyColumn: "GuestId",
                keyValue: -3,
                column: "OnlineBidderOnly",
                value: false);

            migrationBuilder.UpdateData(
                table: "Guests",
                keyColumn: "GuestId",
                keyValue: -2,
                column: "OnlineBidderOnly",
                value: false);

            migrationBuilder.UpdateData(
                table: "Guests",
                keyColumn: "GuestId",
                keyValue: -1,
                column: "OnlineBidderOnly",
                value: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OnlineBidderOnly",
                table: "Guests");
        }
    }
}
