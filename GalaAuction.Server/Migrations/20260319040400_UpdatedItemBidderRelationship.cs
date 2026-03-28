using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GalaAuction.Server.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedItemBidderRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Item_Bidders_WinningBidderNumber",
                table: "Item");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Bidders_BidderNumber",
                table: "Bidders",
                column: "BidderNumber");

            migrationBuilder.AddForeignKey(
                name: "FK_Item_Bidders_WinningBidderNumber",
                table: "Item",
                column: "WinningBidderNumber",
                principalTable: "Bidders",
                principalColumn: "BidderNumber");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Item_Bidders_WinningBidderNumber",
                table: "Item");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Bidders_BidderNumber",
                table: "Bidders");

            migrationBuilder.AddForeignKey(
                name: "FK_Item_Bidders_WinningBidderNumber",
                table: "Item",
                column: "WinningBidderNumber",
                principalTable: "Bidders",
                principalColumn: "BidderId");
        }
    }
}
