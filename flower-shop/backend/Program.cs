
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Net.Mail;

var builder = WebApplication.CreateBuilder(args);

// Config
builder.Services.AddDbContext<Data.ShopContext>(opt =>
{
    var cs = builder.Configuration.GetConnectionString("DefaultConnection")
             ?? "Server=(localdb)\\MSSQLLocalDB;Database=FlowerShopDb;Trusted_Connection=True;MultipleActiveResultSets=true";
    opt.UseSqlServer(cs);
});

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("dev", p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

builder.Services.Configure<EmailOptions>(builder.Configuration.GetSection("Email"));
builder.Services.AddScoped<IEmailService, SmtpEmailService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors("dev");
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<Data.ShopContext>();
    await db.Database.EnsureCreatedAsync();
    await Data.Seed.EnsureSeedData(db);
}

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

// Products with optional filtering and search
// Query params: category (string), q (search in name/description), sort (price_asc|price_desc|name)
app.MapGet("/api/products", async ([FromQuery] string? category, [FromQuery(Name = "q")] string? query, [FromQuery] string? sort, Data.ShopContext db) =>
{
    var products = db.Products.AsNoTracking().Include(p => p.Category).AsQueryable();

    if (!string.IsNullOrWhiteSpace(category))
        products = products.Where(p => p.Category!.Slug == category || p.Category!.Name == category);

    if (!string.IsNullOrWhiteSpace(query))
    {
        var q = query.Trim();
        products = products.Where(p => p.Name.Contains(q) || (p.Description != null && p.Description.Contains(q)));
    }

    products = sort switch
    {
        "price_asc" => products.OrderBy(p => p.Price),
        "price_desc" => products.OrderByDescending(p => p.Price),
        "name" => products.OrderBy(p => p.Name),
        _ => products.OrderBy(p => p.Id)
    };

    var list = await products.Select(p => new
    {
        id = p.Id,
        name = p.Name,
        category = p.Category!.Slug,
        categoryName = p.Category!.Name,
        description = p.Description,
        price = p.Price,
        stockQty = p.StockQty,
        imageUrl = p.ImageUrl
    }).ToListAsync();

    return Results.Ok(list);
});

app.MapGet("/api/categories", async (Data.ShopContext db) =>
{
    var cats = await db.Categories.AsNoTracking()
        .OrderBy(c => c.Name)
        .Select(c => new { slug = c.Slug, name = c.Name }).ToListAsync();
    return Results.Ok(cats);
});

app.MapGet("/api/products/{id:int}", async (int id, Data.ShopContext db) =>
{
    var p = await db.Products.AsNoTracking().Include(p => p.Category)
        .FirstOrDefaultAsync(p => p.Id == id);
    if (p == null) return Results.NotFound();
    return Results.Ok(new
    {
        id = p.Id,
        name = p.Name,
        category = p.Category!.Slug,
        categoryName = p.Category!.Name,
        description = p.Description,
        price = p.Price,
        stockQty = p.StockQty,
        imageUrl = p.ImageUrl
    });
});

// Contact form email
app.MapPost("/api/contact", async ([FromBody] ContactRequest req, IEmailService email, IConfiguration cfg) =>
{
    if (string.IsNullOrWhiteSpace(req.Name) || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Message))
        return Results.BadRequest(new { error = "Name, Email and Message are required." });

    var subject = $"Flower Shop Contact: {req.Subject ?? "No subject"}";
    var body = $"From: {req.Name} <{req.Email}>\nPhone: {req.Phone ?? "-"}\n\nMessage:\n{req.Message}";

    try
    {
        var ok = await email.SendAsync(subject, body);
        return ok ? Results.Ok(new { status = "sent" }) : Results.Ok(new { status = "queued" });
    }
    catch (Exception ex)
    {
        // In dev, just return the body for visibility
        return Results.StatusCode(500);
    }
});

app.Run("http://localhost:5000");

// Models / DTOs / Services
namespace Data
{
    public class ShopContext : DbContext
    {
        public ShopContext(DbContextOptions<ShopContext> options) : base(options) { }
        public DbSet<Product> Products => Set<Product>();
        public DbSet<Category> Categories => Set<Category>();
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Category>().HasIndex(c => c.Slug).IsUnique();
            base.OnModelCreating(modelBuilder);
        }
    }

    public static class Seed
    {
        public static async Task EnsureSeedData(ShopContext db)
        {
            if (!await db.Categories.AnyAsync())
            {
                var flower = new Category { Name = "Flowers", Slug = "flower" };
                var bouquet = new Category { Name = "Bouquets", Slug = "bouquet" };
                var composition = new Category { Name = "Compositions", Slug = "composition" };
                db.Categories.AddRange(flower, bouquet, composition);
                await db.SaveChangesAsync();

                db.Products.AddRange(
                    new Product { Name = "Red Rose", Description = "Single red rose.", Price = 9.99m, StockQty = 200, Category = flower, ImageUrl = "/img/rose.jpg" },
                    new Product { Name = "Tulip Mix", Description = "Tulip variety mix.", Price = 6.50m, StockQty = 150, Category = flower, ImageUrl = "/img/tulip.jpg" },
                    new Product { Name = "Spring Bouquet", Description = "Cheerful seasonal bouquet.", Price = 79.00m, StockQty = 40, Category = bouquet, ImageUrl = "/img/spring-bouquet.jpg" },
                    new Product { Name = "Romance Bouquet", Description = "Roses & greenery.", Price = 129.00m, StockQty = 25, Category = bouquet, ImageUrl = "/img/romance.jpg" },
                    new Product { Name = "Table Composition", Description = "Low table centerpiece.", Price = 149.00m, StockQty = 15, Category = composition, ImageUrl = "/img/centerpiece.jpg" }
                );
                await db.SaveChangesAsync();
            }
        }
    }
}

namespace Models
{
    public class Category
    {
        public int Id { get; set; }
        [MaxLength(64)] public required string Name { get; set; }
        [MaxLength(64)] public required string Slug { get; set; }
        public List<Product> Products { get; set; } = new();
    }

    public class Product
    {
        public int Id { get; set; }
        [MaxLength(128)] public required string Name { get; set; }
        [MaxLength(2048)] public string? Description { get; set; }
        public decimal Price { get; set; }
        public int StockQty { get; set; }
        public string? ImageUrl { get; set; }

        public int CategoryId { get; set; }
        public Models.Category? Category { get; set; }
    }
}

public record ContactRequest
(
    string Name,
    string Email,
    string? Phone,
    string? Subject,
    string Message
);

public class EmailOptions
{
    public bool Enabled { get; set; } = false;
    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 25;
    public bool UseSsl { get; set; } = false;
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string To { get; set; } = "owner@example.com";
    public string From { get; set; } = "no-reply@example.com";
}

public interface IEmailService
{
    Task<bool> SendAsync(string subject, string body);
}

public class SmtpEmailService : IEmailService
{
    private readonly EmailOptions _opt;
    public SmtpEmailService(Microsoft.Extensions.Options.IOptions<EmailOptions> opt) => _opt = opt.Value;

    public async Task<bool> SendAsync(string subject, string body)
    {
        if (!_opt.Enabled) return false; // treat as queued/logged in dev

        using var client = new SmtpClient(_opt.Host, _opt.Port)
        {
            EnableSsl = _opt.UseSsl
        };
        if (!string.IsNullOrWhiteSpace(_opt.Username))
        {
            client.Credentials = new NetworkCredential(_opt.Username, _opt.Password);
        }

        var mail = new MailMessage(_opt.From, _opt.To, subject, body);
        await client.SendMailAsync(mail);
        return true;
    }
}
