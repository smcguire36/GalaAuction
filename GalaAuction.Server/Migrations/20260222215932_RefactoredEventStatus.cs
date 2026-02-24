using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GalaAuction.Server.Migrations
{
    /// <inheritdoc />
    public partial class RefactoredEventStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.UpdateData(
                table: "GalaEvents",
                keyColumn: "GalaEventId",
                keyValue: 1,
                column: "EventStatus",
                value: "0");

            migrationBuilder.Sql(@"
                ALTER TABLE ""GalaEvents"" 
                ALTER COLUMN ""EventStatus"" TYPE integer 
                USING CAST(""EventStatus"" AS integer)
            ");
/*
            migrationBuilder.AlterColumn<int>(
                name: "EventStatus",
                table: "GalaEvents",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
*/
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE ""GalaEvents"" 
                ALTER COLUMN ""EventStatus"" TYPE text 
                USING CAST(""EventStatus"" AS text)
            ");
/*
            migrationBuilder.AlterColumn<string>(
                name: "EventStatus",
                table: "GalaEvents",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");
*/
            migrationBuilder.UpdateData(
                table: "GalaEvents",
                keyColumn: "GalaEventId",
                keyValue: 1,
                column: "EventStatus",
                value: "Setup");
        }
    }
}
