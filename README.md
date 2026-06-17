# Delta Healthcare Web Application

An industry-standard boilerplate setup with a **Next.js** frontend, a **Node.js + Express (TypeScript)** backend, and a **MongoDB** database connection.

## Project Structure

```text
Delta_healthcare/
├── frontend/             # Next.js Application (App Router, Vanilla CSS)
├── backend/              # Node.js Express Server (TypeScript + Mongoose)
└── README.md             # This documentation
```

## Getting Started

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure your MongoDB connection string:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Development URLS
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000](http://localhost:5000)
