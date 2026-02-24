using GalaAuction.Server.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace GalaAuction.Tests
{
    public abstract class DbTestBase : IDisposable
    {
        private readonly SqliteConnection connection;
        protected readonly GalaAuctionDBContext context;

        protected DbTestBase()
        {
            connection = new SqliteConnection("Filename=:memory:");
            connection.Open();
            var options = new DbContextOptionsBuilder<GalaAuctionDBContext>()
                .UseSqlite(connection)
//                .LogTo(Console.WriteLine) // See the generated SQL in your Test Output
//                .EnableSensitiveDataLogging()
                .Options;
            context = new GalaAuctionDBContext(options);
            context.Database.EnsureCreated();

        }

        public void Dispose()
        {
            context.Dispose();
            connection.Dispose();
        }
    }
}
