using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GalaAuction.Server.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedBiddersTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bidder_Guests_GuestId",
                table: "Bidder");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Bidder",
                table: "Bidder");

            migrationBuilder.RenameTable(
                name: "Bidder",
                newName: "Bidders");

            migrationBuilder.RenameIndex(
                name: "IX_Bidder_GuestId",
                table: "Bidders",
                newName: "IX_Bidders_GuestId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Bidders",
                table: "Bidders",
                column: "BidderId");

            migrationBuilder.AddForeignKey(
                name: "FK_Bidders_Guests_GuestId",
                table: "Bidders",
                column: "GuestId",
                principalTable: "Guests",
                principalColumn: "GuestId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bidders_Guests_GuestId",
                table: "Bidders");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Bidders",
                table: "Bidders");

            migrationBuilder.RenameTable(
                name: "Bidders",
                newName: "Bidder");

            migrationBuilder.RenameIndex(
                name: "IX_Bidders_GuestId",
                table: "Bidder",
                newName: "IX_Bidder_GuestId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Bidder",
                table: "Bidder",
                column: "BidderId");

            migrationBuilder.AddForeignKey(
                name: "FK_Bidder_Guests_GuestId",
                table: "Bidder",
                column: "GuestId",
                principalTable: "Guests",
                principalColumn: "GuestId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
