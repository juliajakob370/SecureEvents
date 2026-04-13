using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UserManagementService.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileImageIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProfileImageIndex",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfileImageIndex",
                table: "Users");
        }
    }
}
