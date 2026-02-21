using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GalaAuction.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddedItemJoinForWinningBidder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Item_WinningBidderNumber",
                table: "Item",
                column: "WinningBidderNumber");

            migrationBuilder.AddForeignKey(
                name: "FK_Item_Bidders_WinningBidderNumber",
                table: "Item",
                column: "WinningBidderNumber",
                principalTable: "Bidders",
                principalColumn: "BidderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Item_Bidders_WinningBidderNumber",
                table: "Item");

            migrationBuilder.DropIndex(
                name: "IX_Item_WinningBidderNumber",
                table: "Item");
        }
    }
}
