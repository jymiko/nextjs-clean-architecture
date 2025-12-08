import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Next.js Clean Architecture API',
    version: '1.0.0',
    description: 'API documentation for Next.js Clean Architecture project',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://your-domain.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT authentication token',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'User ID',
            example: 'cmiwwr43m0000x9bfu1krff2o',
          },
          name: {
            type: 'string',
            description: 'User name',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email',
            example: 'john@example.com',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation date',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update date',
          },
        },
      },
      CreateUserRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: {
            type: 'string',
            minLength: 3,
            description: 'User name',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email',
            example: 'john@example.com',
          },
          password: {
            type: 'string',
            minLength: 6,
            description: 'User password',
            example: 'password123',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email',
            example: 'john@example.com',
          },
          password: {
            type: 'string',
            description: 'User password',
            example: 'password123',
          },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: {
            $ref: '#/components/schemas/User',
          },
          token: {
            type: 'string',
            description: 'JWT authentication token',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
            example: 'Validation Error',
          },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                  description: 'Field name',
                  example: 'email',
                },
                message: {
                  type: 'string',
                  description: 'Error message',
                  example: 'Invalid email format',
                },
              },
            },
          },
        },
      },
      Department: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Department ID',
            example: 'cmiwwr43m0000x9bfu1krff2o',
          },
          code: {
            type: 'string',
            description: 'Department code',
            example: 'IT-DEPT',
          },
          name: {
            type: 'string',
            description: 'Department name',
            example: 'Information Technology',
          },
          description: {
            type: 'string',
            nullable: true,
            description: 'Department description',
          },
          headOfDepartmentId: {
            type: 'string',
            nullable: true,
            description: 'ID of the department head',
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the department is active',
            example: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation date',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update date',
          },
        },
      },
      Position: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Position ID',
            example: 'cmiwwr43m0000x9bfu1krff2o',
          },
          code: {
            type: 'string',
            description: 'Position code',
            example: 'MGR-IT',
          },
          name: {
            type: 'string',
            description: 'Position name',
            example: 'IT Manager',
          },
          departmentId: {
            type: 'string',
            nullable: true,
            description: 'Associated department ID',
          },
          level: {
            type: 'integer',
            description: 'Hierarchy level',
            example: 1,
          },
          description: {
            type: 'string',
            nullable: true,
            description: 'Position description',
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the position is active',
            example: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation date',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update date',
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'Authentication related endpoints',
    },
    {
      name: 'Users',
      description: 'User management endpoints',
    },
    {
      name: 'Departments',
      description: 'Department management endpoints',
    },
    {
      name: 'Positions',
      description: 'Position management endpoints',
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './src/app/api/**/*.ts',
    './src/app/api/**/*.tsx',
    './src/app/api/**/*.js',
    './src/app/api/**/*.jsx',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);