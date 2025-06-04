# Full Stack Next TypeScript GraphQL Shop

A modern e-commerce application built with Next.js, TypeScript, GraphQL, and Prisma.

## 🚀 Tech Stack

### Frontend
- Next.js - React framework for server-rendered applications
- TypeScript - Type-safe JavaScript
- Apollo Client - GraphQL client
- Styled Components - CSS-in-JS styling
- React Stripe Checkout - Payment processing
- Jest & Enzyme - Testing framework

### Backend
- GraphQL Yoga - GraphQL server
- Prisma - Database ORM
- PostgreSQL - Database
- JWT - Authentication
- Stripe - Payment processing
- Nodemailer - Email functionality

## 🛠️ Features

- 🔐 User authentication and authorization
- 🛍️ Product browsing and searching
- 🛒 Shopping cart functionality
- 💳 Secure payment processing with Stripe
- 📧 Email notifications
- 📱 Responsive design
- 🔍 Advanced search capabilities
- 📊 Admin dashboard

## 🏗️ Project Structure

```
├── frontend/           # Next.js frontend application
│   ├── components/    # React components
│   ├── pages/        # Next.js pages
│   ├── static/       # Static assets
│   └── lib/          # Utility functions and configurations
│
└── backend/          # GraphQL backend
    ├── src/         # Source code
    └── prisma/      # Database schema and migrations
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Yarn package manager
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd full-stack-next-typescript-shop
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
yarn install

# Install backend dependencies
cd ../backend
yarn install
```

3. Set up environment variables:
```bash
# In backend directory
cp variables.dev.env.example variables.dev.env
# Update the variables in variables.dev.env with your configuration
```

4. Deploy Prisma:
```bash
cd backend
yarn prisma:deploy:dev
```

5. Start the development servers:
```bash
# Start backend (from backend directory)
yarn dev

# Start frontend (from frontend directory)
yarn dev
```

The application will be available at:
- Frontend: http://localhost:7777
- Backend: http://localhost:4000

## 🧪 Testing

```bash
# Frontend tests
cd frontend
yarn test

# Backend tests
cd backend
yarn test
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

