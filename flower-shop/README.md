
# Flower Shop – Angular + .NET 8 + EF Core (SQL Server)

## Structure
- backend/ — .NET 8 Minimal API, EF Core (SQL Server), SMTP email service
- frontend/ — Angular app with Home, Shop (filters + search), About, Contact (email form), Cart

## Run Backend
```bash
cd backend
dotnet restore
dotnet run
# API at http://localhost:5000 (auto-creates and seeds DB)
```

To use real email sending, edit `appsettings.json` → `Email.Enabled=true` and set SMTP settings.

## Run Frontend
```bash
cd frontend
npm install
npm start
# App at http://localhost:4200 (proxy to backend on /api)
```
