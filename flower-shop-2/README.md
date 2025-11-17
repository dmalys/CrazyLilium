# Flower Shop - Angular & .NET 8.0

A full-stack flower shop application built with Angular frontend and .NET 8.0 Minimal API backend.

## Features

- **Home Page**: Welcome screen with shop information
- **Shop/Browse**: Browse flowers, bouquets, and compositions with:
  - Category filters
  - Product type filters (Flower, Bouquet, Composition)
  - Search functionality
  - Quantity controls
  - Add to cart functionality
- **About Us**: Information about the shop
- **Contact**: Contact form with email sending capability
- **Cart**: Shopping cart with guest support (no authentication required)
- **Database**: EF Core with MSSQL for data persistence

## Project Structure

```
flower-shop-2/
├── backend/
│   └── FlowerShop.Api/          # .NET 8.0 Minimal API
│       ├── Models/               # Data models
│       ├── Data/                 # DbContext
│       ├── Services/             # Email service
│       └── Program.cs            # API endpoints
└── frontend/                     # Angular application
    └── src/
        └── app/
            ├── pages/            # Page components
            ├── core/             # Services and models
            └── app.component.*   # Main app component
```

## Prerequisites

- .NET 8.0 SDK
- Node.js (v18 or higher)
- SQL Server (LocalDB or full SQL Server instance)
- npm or yarn

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd flower-shop-2/backend/FlowerShop.Api
   ```

2. Update the connection string in `appsettings.json` if needed:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=FlowerShopDb;Trusted_Connection=True;MultipleActiveResultSets=true"
   }
   ```

3. Configure email settings in `appsettings.json` (optional, for contact form):
   ```json
   "EmailSettings": {
     "SmtpHost": "smtp.gmail.com",
     "SmtpPort": "587",
     "SmtpUser": "your-email@gmail.com",
     "SmtpPassword": "your-app-password",
     "FromEmail": "your-email@gmail.com",
     "ShopEmail": "shop@flowershop.com"
   }
   ```

4. Run the application:
   ```bash
   dotnet run
   ```

   The API will be available at `https://localhost:7150` (or the port shown in the console).

5. The database will be automatically created and seeded with sample data on first run.

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd flower-shop-2/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the proxy configuration in `proxy.conf.json` if your backend runs on a different port:
   ```json
   {
     "/api": {
       "target": "https://localhost:7150",
       "secure": false,
       "changeOrigin": true
     }
   }
   ```

4. Run the development server:
   ```bash
   npm start
   ```

   The application will be available at `http://localhost:4200`

## API Endpoints

### Products
- `GET /api/products` - Get all products (supports query parameters: `search`, `categoryId`, `type`)
- `GET /api/products/{id}` - Get a specific product

### Categories
- `GET /api/categories` - Get all categories

### Contact
- `POST /api/contact` - Send contact form email
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Inquiry",
    "message": "Hello..."
  }
  ```

## Features Implemented

✅ Home screen with shop information  
✅ Browse page with products, filters, and search  
✅ Category and product type filters  
✅ Search functionality  
✅ Add to cart (guest mode, no authentication)  
✅ Shopping cart with quantity management  
✅ About Us page  
✅ Contact page with email form  
✅ EF Core with MSSQL  
✅ Email sending service  
✅ Responsive design  

## Notes

- Cart data is stored in browser localStorage (guest mode)
- Payment functionality is not implemented (as requested)
- Email configuration is required for the contact form to work
- The database is automatically created and seeded on first run

## Development

### Backend
- Uses .NET 8.0 Minimal API
- EF Core for database access
- MSSQL database
- CORS enabled for Angular frontend

### Frontend
- Angular 17+ with standalone components
- SCSS for styling
- RxJS for reactive programming
- LocalStorage for cart persistence

## License

This project is created for demonstration purposes.


Project Summary
Backend (.NET 8.0 Minimal API)
EF Core with MSSQL database
Models: Product, Category, ContactRequest
API endpoints:
GET /api/products (with search, category, and type filters)
GET /api/products/{id}
GET /api/categories
POST /api/contact (with email sending)
Database auto-creation and seeding with sample data
CORS configured for Angular frontend
Email service for contact form
Frontend (Angular)
Pages:
Home: Welcome screen with shop information
Shop: Browse products with filters, search, and add to cart
About Us: Shop information
Contact: Contact form with address and email
Cart: Shopping cart with quantity management
Features:
Category filters
Product type filters (Flower, Bouquet, Composition)
Search functionality
Guest cart (localStorage, no authentication)
Responsive design
Cart badge in navigation
To Run:
Backend:
   cd flower-shop-2/backend/FlowerShop.Api   dotnet run
Frontend:
   cd flower-shop-2/frontend   npm install   npm start
The application will be available at http://localhost:4200 and the API at https://localhost:7150.
Note: Configure email settings in appsettings.json for the contact form to send emails. The database will be automatically created on first run with sample products and categories.