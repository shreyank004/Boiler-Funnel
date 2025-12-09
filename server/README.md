# Boiler Quote Backend Server

Backend server for storing boiler quote form submissions in MongoDB.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB connection string
     - For local MongoDB: `mongodb://localhost:27017/boiler-quotes`
     - For MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/boiler-quotes`

3. **Start the server:**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:5000` by default.

## API Endpoints

### POST `/api/forms/submit`
Submit a new form submission.

**Request Body:**
```json
{
  "fuelType": "mains-gas",
  "boilerType": "combi",
  "propertyType": "detached",
  "bedroomCount": "3",
  "bathtubCount": "2",
  "showerCubicleCount": "1",
  "flueExitType": "external-wall",
  "replacementTiming": "asap",
  "postcode": "SW1A 1AA",
  "address": "10 Downing Street, London",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "07123456789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Form submission saved successfully",
  "id": "507f1f77bcf86cd799439011"
}
```

### GET `/api/forms/all`
Get all form submissions.

**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

### GET `/api/forms/:id`
Get a single form submission by ID.

### PUT `/api/forms/:id`
Update a form submission (e.g., add product selection or finance details).

**Request Body:**
```json
{
  "selectedProduct": {
    "id": "product-1",
    "name": "Combi Boiler",
    "brand": "Worcester",
    "price": "£2,499"
  },
  "financeDetails": {
    "depositPercentage": 10,
    "depositAmount": 249.90,
    "paymentOption": {
      "months": 24,
      "apr": 9.9
    },
    "monthlyPayment": 102.50,
    "totalPayable": 2709.90
  }
}
```

## MongoDB Schema

The form submission schema includes:
- Form data (fuel type, boiler type, property details, etc.)
- Contact information (name, email, phone)
- Product selection (optional)
- Finance calculator details (optional)
- Timestamps (createdAt, updatedAt)

