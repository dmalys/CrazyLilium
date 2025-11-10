
# Flower Shop API (.NET 8, EF Core, SQL Server)
Endpoints:
- GET /api/health
- GET /api/categories
- GET /api/products?category={slug}&q={search}&sort=price_asc|price_desc|name
- GET /api/products/{id}
- POST /api/contact  { name, email, phone?, subject?, message }

## Run
1. Adjust connection string in appsettings.json (DefaultConnection) for your SQL Server (localdb by default).
2. `dotnet restore`
3. `dotnet run` (listens on http://localhost:5000)
Database is auto-created and seeded on startup.

## Email
Set `Email.Enabled = true` and provide SMTP details to actually send emails. When disabled, the API returns `{status: "queued"}` for contact requests.
