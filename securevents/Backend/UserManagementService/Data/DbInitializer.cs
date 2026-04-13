using System.Text.RegularExpressions;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace UserManagementService.Data;

internal static class DbInitializer
{
    public static void Initialize(DbContext db, string serviceLabel)
    {
        var connectionString = db.Database.GetConnectionString()
            ?? throw new InvalidOperationException("No connection string configured.");

        EnsureDatabase(connectionString, serviceLabel);
        CreateMissingTables(db, serviceLabel);
        HardenSavedCardsTable(db, serviceLabel);
    }

    private static void EnsureDatabase(string connectionString, string serviceLabel)
    {
        var target = new SqlConnectionStringBuilder(connectionString);
        var dbName = target.InitialCatalog;
        if (string.IsNullOrWhiteSpace(dbName))
        {
            throw new InvalidOperationException("Connection string is missing a database name.");
        }
        ValidateIdentifier(dbName);

        var masterBuilder = new SqlConnectionStringBuilder(connectionString)
        {
            InitialCatalog = "master"
        };

        for (var attempt = 1; attempt <= 5; attempt++)
        {
            try
            {
                using var conn = new SqlConnection(masterBuilder.ConnectionString);
                conn.Open();

                using (var check = conn.CreateCommand())
                {
                    check.CommandText = "SELECT DB_ID(@name)";
                    check.Parameters.AddWithValue("@name", dbName);
                    if (check.ExecuteScalar() is int) return;
                }

                using var create = conn.CreateCommand();
                create.CommandText = $"CREATE DATABASE [{dbName}]";
                try
                {
                    create.ExecuteNonQuery();
                }
                catch (SqlException ex) when (ex.Number == 1801)
                {
                }
                return;
            }
            catch (Exception ex) when (attempt < 5)
            {
                Console.WriteLine($"[{serviceLabel}] DB ensure attempt {attempt} failed: {ex.Message}. Retrying...");
                Thread.Sleep(attempt * 2000);
            }
        }
    }

    private static void CreateMissingTables(DbContext db, string serviceLabel)
    {
        var modelTables = db.Model.GetEntityTypes()
            .Select(e => e.GetTableName())
            .Where(n => !string.IsNullOrWhiteSpace(n))
            .Select(n => n!)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var existing = QueryExistingTables(db);
        if (modelTables.All(existing.Contains)) return;

        var script = db.Database.GenerateCreateScript();
        var statements = Regex.Split(script, @"^\s*GO\s*;?\s*$", RegexOptions.Multiline);

        foreach (var raw in statements)
        {
            var statement = raw.Trim();
            if (statement.Length == 0) continue;
            try
            {
                db.Database.ExecuteSqlRaw(statement);
            }
            catch (Exception ex) when (IsAlreadyExists(ex))
            {
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[{serviceLabel}] DDL failed: {ex.Message}");
                throw;
            }
        }
    }

    private static HashSet<string> QueryExistingTables(DbContext db)
    {
        var tables = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        using var conn = new SqlConnection(db.Database.GetConnectionString());
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'";
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            tables.Add(reader.GetString(0));
        }
        return tables;
    }

    private static void HardenSavedCardsTable(DbContext db, string serviceLabel)
    {
        const string sql = """
            IF OBJECT_ID(N'dbo.SavedCards', N'U') IS NULL
                RETURN;

            ALTER TABLE dbo.SavedCards ALTER COLUMN CardName NVARCHAR(50) NOT NULL;
            ALTER TABLE dbo.SavedCards ALTER COLUMN CardLast4 NVARCHAR(4) NOT NULL;
            ALTER TABLE dbo.SavedCards ALTER COLUMN ExpiryDate NVARCHAR(5) NOT NULL;
            ALTER TABLE dbo.SavedCards ALTER COLUMN BillingAddress NVARCHAR(150) NOT NULL;

            IF NOT EXISTS (
                SELECT 1
                FROM sys.foreign_keys
                WHERE name = N'FK_SavedCards_Users_UserId'
                  AND parent_object_id = OBJECT_ID(N'dbo.SavedCards'))
            BEGIN
                ALTER TABLE dbo.SavedCards WITH CHECK
                ADD CONSTRAINT FK_SavedCards_Users_UserId
                FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE;
            END;

            IF NOT EXISTS (
                SELECT 1
                FROM sys.indexes
                WHERE name = N'IX_SavedCards_UserId_IsDeleted'
                  AND object_id = OBJECT_ID(N'dbo.SavedCards'))
            BEGIN
                CREATE INDEX IX_SavedCards_UserId_IsDeleted
                ON dbo.SavedCards(UserId, IsDeleted);
            END;

            IF NOT EXISTS (
                SELECT 1
                FROM sys.check_constraints
                WHERE name = N'CK_SavedCards_CardLast4_Format'
                  AND parent_object_id = OBJECT_ID(N'dbo.SavedCards'))
            BEGIN
                ALTER TABLE dbo.SavedCards
                ADD CONSTRAINT CK_SavedCards_CardLast4_Format
                CHECK (CardLast4 LIKE '[0-9][0-9][0-9][0-9]');
            END;

            IF NOT EXISTS (
                SELECT 1
                FROM sys.check_constraints
                WHERE name = N'CK_SavedCards_ExpiryDate_Format'
                  AND parent_object_id = OBJECT_ID(N'dbo.SavedCards'))
            BEGIN
                ALTER TABLE dbo.SavedCards
                ADD CONSTRAINT CK_SavedCards_ExpiryDate_Format
                CHECK (
                    ExpiryDate LIKE '0[1-9]/[0-9][0-9]'
                    OR ExpiryDate LIKE '1[0-2]/[0-9][0-9]'
                );
            END;
            """;

        try
        {
            db.Database.ExecuteSqlRaw(sql);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[{serviceLabel}] SavedCards hardening failed: {ex.Message}");
            throw;
        }
    }

    private static bool IsAlreadyExists(Exception ex) =>
        ex.Message.Contains("already an object named", StringComparison.OrdinalIgnoreCase) ||
        ex.Message.Contains("already exists", StringComparison.OrdinalIgnoreCase);

    private static void ValidateIdentifier(string name)
    {
        foreach (var c in name)
        {
            if (c == '[' || c == ']' || c == ';' || c < ' ')
            {
                throw new ArgumentException($"Invalid database identifier: '{name}'");
            }
        }
    }
}
