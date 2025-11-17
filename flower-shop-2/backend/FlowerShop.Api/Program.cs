using Microsoft.EntityFrameworkCore;
using FlowerShop.Api.Data;
using FlowerShop.Api.Models;
using FlowerShop.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add DbContext
builder.Services.AddDbContext<FlowerShopDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add Email Service
builder.Services.AddScoped<EmailService>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAngular");

// Ensure database is created and seeded
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<FlowerShopDbContext>();
    dbContext.Database.EnsureCreated();
    SeedData(dbContext);
}

// API Endpoints

// Categories
app.MapGet("/api/categories", async (FlowerShopDbContext db) =>
{
    var categories = await db.Categories.ToListAsync();
    return Results.Ok(categories);
})
.WithName("GetCategories")
.WithOpenApi();

app.MapPost("/api/categories", async (Category category, FlowerShopDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(category.Name))
    {
        return Results.BadRequest("Category name is required.");
    }

    db.Categories.Add(category);
    await db.SaveChangesAsync();
    return Results.Created($"/api/categories/{category.Id}", category);
})
.WithName("CreateCategory")
.WithOpenApi();

// Products
app.MapGet("/api/products", async (FlowerShopDbContext db, string? search, int? categoryId, string? type) =>
{
    var query = db.Products.Include(p => p.Category).AsQueryable();

    if (!string.IsNullOrWhiteSpace(search))
    {
        query = query.Where(p => p.Name.Contains(search) || 
                                 (p.Description != null && p.Description.Contains(search)));
    }

    if (categoryId.HasValue)
    {
        query = query.Where(p => p.CategoryId == categoryId.Value);
    }

    if (!string.IsNullOrWhiteSpace(type) && Enum.TryParse<ProductType>(type, true, out var productType))
    {
        query = query.Where(p => p.Type == productType);
    }

    var products = await query.ToListAsync();
    return Results.Ok(products);
})
.WithName("GetProducts")
.WithOpenApi();

app.MapGet("/api/products/{id}", async (FlowerShopDbContext db, int id) =>
{
    var product = await db.Products.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);
    if (product == null)
        return Results.NotFound();
    return Results.Ok(product);
})
.WithName("GetProduct")
.WithOpenApi();

app.MapPost("/api/products", async (Product product, FlowerShopDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(product.Name))
    {
        return Results.BadRequest("Product name is required.");
    }

    if (product.Price <= 0)
    {
        return Results.BadRequest("Product price must be greater than 0.");
    }

    if (product.StockQuantity < 0)
    {
        return Results.BadRequest("Stock quantity cannot be negative.");
    }

    // Verify category exists
    var categoryExists = await db.Categories.AnyAsync(c => c.Id == product.CategoryId);
    if (!categoryExists)
    {
        return Results.BadRequest("Category does not exist.");
    }

    db.Products.Add(product);
    await db.SaveChangesAsync();
    
    // Load category for response
    await db.Entry(product).Reference(p => p.Category).LoadAsync();
    return Results.Created($"/api/products/{product.Id}", product);
})
.WithName("CreateProduct")
.WithOpenApi();

// Contact
app.MapPost("/api/contact", async (ContactRequest request, EmailService emailService, IConfiguration configuration) =>
{
    if (string.IsNullOrWhiteSpace(request.Name) || 
        string.IsNullOrWhiteSpace(request.Email) || 
        string.IsNullOrWhiteSpace(request.Message))
    {
        return Results.BadRequest("Name, Email, and Message are required.");
    }

    var shopEmail = configuration["EmailSettings:ShopEmail"] ?? "shop@flowershop.com";
    var subject = $"Contact Form: {request.Subject}";
    var body = $@"
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> {request.Name}</p>
        <p><strong>Email:</strong> {request.Email}</p>
        <p><strong>Subject:</strong> {request.Subject}</p>
        <p><strong>Message:</strong></p>
        <p>{request.Message}</p>
    ";

    var success = await emailService.SendEmailAsync(shopEmail, subject, body);
    
    if (success)
    {
        return Results.Ok(new { message = "Email sent successfully" });
    }
    else
    {
        return Results.StatusCode(500);
    }
})
.WithName("SendContactEmail")
.WithOpenApi();

// Forum Posts
app.MapGet("/api/forum/posts", async (FlowerShopDbContext db, string? category) =>
{
    var query = db.ForumPosts.AsQueryable();

    if (!string.IsNullOrWhiteSpace(category) && Enum.TryParse<ForumCategory>(category, true, out var forumCategory))
    {
        query = query.Where(p => p.Category == forumCategory);
    }

    var posts = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();
    return Results.Ok(posts);
})
.WithName("GetForumPosts")
.WithOpenApi();

app.MapPost("/api/forum/posts", async (ForumPost post, FlowerShopDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(post.Title))
    {
        return Results.BadRequest("Post title is required.");
    }

    post.CreatedAt = DateTime.UtcNow;
    db.ForumPosts.Add(post);
    await db.SaveChangesAsync();
    return Results.Created($"/api/forum/posts/{post.Id}", post);
})
.WithName("CreateForumPost")
.WithOpenApi();

app.Run();

// Seed Data
void SeedData(FlowerShopDbContext db)
{
    if (db.Categories.Any())
        return;

    var categories = new List<Category>
    {
        new Category { Name = "Roses", Description = "Beautiful roses in various colors" },
        new Category { Name = "Tulips", Description = "Elegant tulips for any occasion" },
        new Category { Name = "Lilies", Description = "Fragrant lilies" },
        new Category { Name = "Mixed Bouquets", Description = "Mixed flower arrangements" },
        new Category { Name = "Wedding Compositions", Description = "Special wedding arrangements" },
        new Category { Name = "Funeral Compositions", Description = "Sympathy arrangements" }
    };

    db.Categories.AddRange(categories);
    db.SaveChanges();

    var products = new List<Product>
    {
        new Product { Name = "Red Roses Bouquet", Description = "A beautiful bouquet of 12 red roses", Price = 45.99m, StockQuantity = 50, CategoryId = 1, Type = ProductType.Bouquet, ImageUrl = "https://via.placeholder.com/300x300?text=Red+Roses" },
        new Product { Name = "White Lilies", Description = "Elegant white lilies", Price = 35.99m, StockQuantity = 30, CategoryId = 3, Type = ProductType.Flower, ImageUrl = "https://via.placeholder.com/300x300?text=White+Lilies" },
        new Product { Name = "Spring Tulip Mix", Description = "Colorful mix of spring tulips", Price = 28.99m, StockQuantity = 40, CategoryId = 2, Type = ProductType.Bouquet, ImageUrl = "https://via.placeholder.com/300x300?text=Tulips" },
        new Product { Name = "Wedding Centerpiece", Description = "Elegant wedding table centerpiece", Price = 120.00m, StockQuantity = 15, CategoryId = 5, Type = ProductType.Composition, ImageUrl = "https://via.placeholder.com/300x300?text=Wedding" },
        new Product { Name = "Pink Roses", Description = "Delicate pink roses", Price = 38.99m, StockQuantity = 35, CategoryId = 1, Type = ProductType.Flower, ImageUrl = "https://via.placeholder.com/300x300?text=Pink+Roses" },
        new Product { Name = "Mixed Spring Bouquet", Description = "Fresh spring flowers mix", Price = 42.99m, StockQuantity = 25, CategoryId = 4, Type = ProductType.Bouquet, ImageUrl = "https://via.placeholder.com/300x300?text=Spring+Bouquet" },
        new Product { Name = "Sympathy Wreath", Description = "Respectful funeral arrangement", Price = 85.00m, StockQuantity = 20, CategoryId = 6, Type = ProductType.Composition, ImageUrl = "https://via.placeholder.com/300x300?text=Sympathy" },
        new Product { Name = "Yellow Roses", Description = "Bright yellow roses", Price = 36.99m, StockQuantity = 30, CategoryId = 1, Type = ProductType.Flower, ImageUrl = "https://via.placeholder.com/300x300?text=Yellow+Roses" }
    };

    db.Products.AddRange(products);
    db.SaveChanges();
}
