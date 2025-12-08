# Next.js Clean Architecture Project

A production-ready Next.js application implementing Clean Architecture patterns with authentication, database integration, and comprehensive security measures.

## Architecture

This project follows Clean Architecture principles with clear separation of concerns:

- **Domain Layer**: Business entities and use cases
- **Application Layer**: Application services and orchestration
- **Infrastructure Layer**: Database, external services, and technical implementations
- **Presentation Layer**: API routes and UI components

## Features

- ✅ Clean Architecture with proper dependency injection
- ✅ Authentication with JWT
- ✅ PostgreSQL database with Prisma ORM
- ✅ Input validation with Zod
- ✅ Comprehensive error handling
- ✅ Security measures (CORS, rate limiting, security headers)
- ✅ TypeScript support
- ✅ Testing setup with Jest

## Getting Started

### Prerequisites

- Node.js (18+)
- PostgreSQL (running on port 5433)
- Docker (if using PostgreSQL container)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd nextjs-clean-architecture
```

2. Install dependencies
```bash
pnpm install
```

3. Setup environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Setup PostgreSQL with Docker (optional)
```bash
docker run --name postgres-nextjs -e POSTGRES_PASSWORD=gacoan -p 5433:5432 -d postgres
```

5. Run database migrations
```bash
pnpm exec prisma migrate dev --name init
```

6. Start the development server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## API Documentation

#### ReDoc Documentation (Recommended)

Clean and modern API documentation is available at:
- **ReDoc**: [http://localhost:3000/docs](http://localhost:3000/docs) - Modern, three-panel API documentation
- **OpenAPI JSON**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs) - Raw API specification

ReDoc provides:
- Clean, responsive design
- Interactive API testing
- Request/response examples
- Authentication setup
- Error response documentation
- Better mobile experience

#### Alternative Tools

You can also view the API documentation using these external tools:
- **Swagger Editor**: [https://editor.swagger.io/?url=http://localhost:3000/api/docs](https://editor.swagger.io/?url=http://localhost:3000/api/docs)
- **Redoc**: [https://redocly.github.io/redoc/?url=http://localhost:3000/api/docs](https://redocly.github.io/redoc/?url=http://localhost:3000/api/docs)

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### User Management Endpoints

#### Get All Users (Protected)
```http
GET /api/users
Authorization: Bearer <token>
```

#### Create User (Protected)
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

## Environment Variables

Create a `.env.local` file with the following:

```env
# Database
DATABASE_URL="postgresql://postgres:gacoan@localhost:5433/nextjs_clean_arch"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXTAUTH_SECRET="your-nextauth-secret-key-change-this"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── users/         # User management endpoints
│   └── globals.css        # Global styles
├── domain/                # Business logic
│   ├── entities/          # Domain entities
│   ├── repositories/      # Repository interfaces
│   └── usecases/          # Use cases
├── application/           # Application services
│   └── services/          # Service classes
├── infrastructure/        # Technical implementations
│   ├── auth/              # Authentication utilities
│   ├── database/          # Database connection
│   ├── di/                # Dependency injection
│   ├── errors/            # Error handling
│   ├── middleware/        # Custom middleware
│   ├── repositories/      # Repository implementations
│   └── validation/        # Input validation schemas
├── presentation/          # UI components
└── __tests__/             # Test files
```

## Development Commands

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Database migrations
pnpm exec prisma migrate dev

# Database studio
pnpm exec prisma studio

# Lint code
pnpm lint
```

## Security Features

- JWT-based authentication with session management
- Rate limiting on API endpoints
- CORS configuration
- Security headers (XSS protection, content type options, etc.)
- Input validation and sanitization
- Password hashing with bcrypt

## Testing

The project includes a comprehensive test setup using Jest and React Testing Library. Tests are organized by layer:

- Unit tests for use cases
- Integration tests for repositories
- Component tests for UI elements

To run tests:
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## Deployment

This project is ready for deployment on Vercel or any other Node.js hosting platform.

### Vercel Deployment

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

1. Build the application:
```bash
pnpm build
```

2. Set environment variables
3. Start the production server:
```bash
pnpm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes with tests
4. Run the test suite
5. Submit a pull request

## License

This project is licensed under the MIT License.