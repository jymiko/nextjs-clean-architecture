export const openApiSpec = {
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
          id: { type: 'string', example: 'cmiwwr43m0000x9bfu1krff2o' },
          employeeId: { type: 'string', example: 'EMP-001' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          avatar: { type: 'string', nullable: true },
          signature: { type: 'string', nullable: true, description: 'Base64 encoded signature image from canvas drawing' },
          isActive: { type: 'boolean', example: true },
          roleId: { type: 'string', nullable: true },
          departmentId: { type: 'string', nullable: true },
          positionId: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Department: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cmiwwr43m0000x9bfu1krff2o' },
          code: { type: 'string', example: 'IT-DEPT' },
          name: { type: 'string', example: 'Information Technology' },
          description: { type: 'string', nullable: true },
          headOfDepartmentId: { type: 'string', nullable: true },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Position: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cmiwwr43m0000x9bfu1krff2o' },
          code: { type: 'string', example: 'MGR-IT' },
          name: { type: 'string', example: 'IT Manager' },
          departmentId: { type: 'string', nullable: true },
          level: { type: 'integer', example: 1 },
          description: { type: 'string', nullable: true },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Role: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cmiwwr43m0000x9bfu1krff2o' },
          code: { type: 'string', example: 'ADMIN' },
          name: { type: 'string', example: 'Administrator' },
          description: { type: 'string', nullable: true },
          level: { type: 'integer', example: 1 },
          isSystem: { type: 'boolean', example: false },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Permission: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cmiwwr43m0000x9bfu1krff2o' },
          name: { type: 'string', example: 'users.create' },
          resource: { type: 'string', example: 'users' },
          action: { type: 'string', example: 'create' },
          description: { type: 'string', nullable: true },
          category: { type: 'string', example: 'user_management' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          data: { type: 'array', items: {} },
          total: { type: 'integer', example: 100 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          totalPages: { type: 'integer', example: 10 },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Validation Error' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Invalid email format' },
              },
            },
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', example: 'password123' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
        },
      },
      UpdateProfileRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 100, example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
        },
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword', 'confirmPassword'],
        properties: {
          currentPassword: { type: 'string', example: 'oldPassword123' },
          newPassword: { type: 'string', minLength: 6, example: 'NewPassword123', description: 'Must contain uppercase, lowercase, and number' },
          confirmPassword: { type: 'string', example: 'NewPassword123' },
        },
      },
      UpdateSignatureRequest: {
        type: 'object',
        required: ['signature'],
        properties: {
          signature: {
            type: 'string',
            nullable: true,
            example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
            description: 'Base64 encoded image from canvas drawing. Set to null to remove signature.',
          },
        },
      },
      SignatureResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              signature: { type: 'string', nullable: true },
              hasSignature: { type: 'boolean', example: true },
            },
          },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
        },
      },
      ProfileResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/User' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Authentication', description: 'Authentication endpoints' },
    { name: 'Profile', description: 'User profile management endpoints (self-service)' },
    { name: 'Users', description: 'User management endpoints (admin)' },
    { name: 'Departments', description: 'Department management endpoints' },
    { name: 'Positions', description: 'Position management endpoints' },
    { name: 'Roles', description: 'Role management endpoints' },
    { name: 'Permissions', description: 'Permission management endpoints' },
  ],
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Authentication'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', minLength: 3, example: 'John Doe' },
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                  password: { type: 'string', minLength: 6, example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'User registered successfully' },
          '400': { description: 'Validation error' },
          '409': { description: 'Email already exists' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Login user',
        tags: ['Authentication'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        summary: 'Logout user',
        tags: ['Authentication'],
        responses: {
          '200': { description: 'Logout successful' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        summary: 'Get current user profile',
        tags: ['Authentication'],
        responses: {
          '200': {
            description: 'Current user profile',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/auth/forgot-password': {
      post: {
        summary: 'Request password reset',
        tags: ['Authentication'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Password reset email sent' },
        },
      },
    },
    '/api/auth/reset-password': {
      post: {
        summary: 'Reset password with token',
        tags: ['Authentication'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'password'],
                properties: {
                  token: { type: 'string' },
                  password: { type: 'string', minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Password reset successful' },
          '400': { description: 'Invalid or expired token' },
        },
      },
    },
    '/api/auth/profile': {
      get: {
        summary: 'Get current user profile',
        description: 'Returns the full profile of the currently authenticated user including department, position, and role information.',
        tags: ['Profile'],
        responses: {
          '200': {
            description: 'User profile retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProfileResponse' },
              },
            },
          },
          '401': { description: 'Unauthorized - Invalid or missing token' },
          '404': { description: 'User not found' },
        },
      },
      put: {
        summary: 'Update current user profile',
        description: 'Update profile information for the currently authenticated user. Only name and email can be updated.',
        tags: ['Profile'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProfileRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Profile updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Profile updated successfully' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '400': { description: 'Validation error' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'User not found' },
        },
      },
    },
    '/api/auth/profile/password': {
      put: {
        summary: 'Change password',
        description: 'Change the password for the currently authenticated user. Requires current password verification.',
        tags: ['Profile'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChangePasswordRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Password changed successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            },
          },
          '400': {
            description: 'Validation error or incorrect current password',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string', example: 'Current password is incorrect' },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '404': { description: 'User not found' },
        },
      },
    },
    '/api/auth/profile/signature': {
      get: {
        summary: 'Get user signature',
        description: 'Retrieve the signature of the currently authenticated user.',
        tags: ['Profile'],
        responses: {
          '200': {
            description: 'Signature retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SignatureResponse' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '404': { description: 'User not found' },
        },
      },
      put: {
        summary: 'Update user signature',
        description: 'Update or set the signature for the currently authenticated user. The signature should be a base64 encoded image from canvas drawing. Maximum size is 500KB.',
        tags: ['Profile'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateSignatureRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Signature updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Signature updated successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        signature: { type: 'string', nullable: true },
                        hasSignature: { type: 'boolean', example: true },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error or signature too large',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string', example: 'Signature image is too large' },
                    details: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          field: { type: 'string', example: 'signature' },
                          message: { type: 'string', example: 'Signature must be less than 500KB' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '404': { description: 'User not found' },
        },
      },
      delete: {
        summary: 'Remove user signature',
        description: 'Remove the signature for the currently authenticated user.',
        tags: ['Profile'],
        responses: {
          '200': {
            description: 'Signature removed successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '404': { description: 'User not found' },
        },
      },
    },
    '/api/users': {
      get: {
        summary: 'Get all users',
        tags: ['Users'],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'roleId', in: 'query', schema: { type: 'string' } },
          { name: 'departmentId', in: 'query', schema: { type: 'string' } },
          { name: 'positionId', in: 'query', schema: { type: 'string' } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['name', 'email', 'employeeId', 'createdAt'] } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
        ],
        responses: {
          '200': { description: 'List of users' },
        },
      },
      post: {
        summary: 'Create a new user',
        tags: ['Users'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                  employeeId: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                  roleId: { type: 'string' },
                  departmentId: { type: 'string' },
                  positionId: { type: 'string' },
                  isActive: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'User created successfully' },
          '400': { description: 'Validation error' },
          '409': { description: 'Email or employee ID already exists' },
        },
      },
    },
    '/api/users/{id}': {
      get: {
        summary: 'Get user by ID',
        tags: ['Users'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'User details' },
          '404': { description: 'User not found' },
        },
      },
      put: {
        summary: 'Update user',
        tags: ['Users'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  employeeId: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                  roleId: { type: 'string' },
                  departmentId: { type: 'string' },
                  positionId: { type: 'string' },
                  avatar: { type: 'string' },
                  signature: { type: 'string', description: 'Base64 encoded signature image' },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'User updated successfully' },
          '400': { description: 'Validation error' },
          '404': { description: 'User not found' },
          '409': { description: 'Email or employee ID already taken' },
        },
      },
      delete: {
        summary: 'Delete user',
        tags: ['Users'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'User deleted successfully' },
          '404': { description: 'User not found' },
        },
      },
    },
    '/api/departments': {
      get: {
        summary: 'Get all departments',
        tags: ['Departments'],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['name', 'code', 'createdAt'] } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
        ],
        responses: {
          '200': { description: 'List of departments' },
        },
      },
      post: {
        summary: 'Create a new department',
        tags: ['Departments'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'name'],
                properties: {
                  code: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  headOfDepartmentId: { type: 'string' },
                  isActive: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Department created successfully' },
          '400': { description: 'Validation error' },
          '409': { description: 'Department code or name already exists' },
        },
      },
    },
    '/api/departments/{id}': {
      get: {
        summary: 'Get department by ID',
        tags: ['Departments'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Department details' },
          '404': { description: 'Department not found' },
        },
      },
      put: {
        summary: 'Update department',
        tags: ['Departments'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  headOfDepartmentId: { type: 'string' },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Department updated successfully' },
          '400': { description: 'Validation error' },
          '404': { description: 'Department not found' },
          '409': { description: 'Department code or name already exists' },
        },
      },
      delete: {
        summary: 'Delete department',
        tags: ['Departments'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Department deleted successfully' },
          '404': { description: 'Department not found' },
          '409': { description: 'Cannot delete department with assigned employees or positions' },
        },
      },
    },
    '/api/positions': {
      get: {
        summary: 'Get all positions',
        tags: ['Positions'],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'departmentId', in: 'query', schema: { type: 'string' } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['name', 'code', 'level', 'createdAt'] } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
        ],
        responses: {
          '200': { description: 'List of positions' },
        },
      },
      post: {
        summary: 'Create a new position',
        tags: ['Positions'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'name'],
                properties: {
                  code: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  departmentId: { type: 'string' },
                  level: { type: 'integer', default: 1 },
                  isActive: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Position created successfully' },
          '400': { description: 'Validation error' },
          '409': { description: 'Position code already exists' },
        },
      },
    },
    '/api/positions/{id}': {
      get: {
        summary: 'Get position by ID',
        tags: ['Positions'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Position details' },
          '404': { description: 'Position not found' },
        },
      },
      put: {
        summary: 'Update position',
        tags: ['Positions'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  departmentId: { type: 'string' },
                  level: { type: 'integer' },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Position updated successfully' },
          '400': { description: 'Validation error' },
          '404': { description: 'Position not found' },
          '409': { description: 'Position code already exists' },
        },
      },
      delete: {
        summary: 'Delete position',
        tags: ['Positions'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Position deleted successfully' },
          '404': { description: 'Position not found' },
          '409': { description: 'Cannot delete position with assigned employees' },
        },
      },
    },
    '/api/roles': {
      get: {
        summary: 'Get all roles',
        tags: ['Roles'],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['name', 'code', 'level', 'createdAt'] } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
        ],
        responses: {
          '200': { description: 'List of roles' },
        },
      },
      post: {
        summary: 'Create a new role',
        tags: ['Roles'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'name'],
                properties: {
                  code: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  level: { type: 'integer', default: 1 },
                  permissions: { type: 'array', items: { type: 'string' } },
                  isActive: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Role created successfully' },
          '400': { description: 'Validation error' },
          '409': { description: 'Role code or name already exists' },
        },
      },
    },
    '/api/roles/{id}': {
      get: {
        summary: 'Get role by ID',
        tags: ['Roles'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Role details' },
          '404': { description: 'Role not found' },
        },
      },
      put: {
        summary: 'Update role',
        tags: ['Roles'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  level: { type: 'integer' },
                  permissions: { type: 'array', items: { type: 'string' } },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Role updated successfully' },
          '400': { description: 'Validation error' },
          '403': { description: 'Cannot modify system roles' },
          '404': { description: 'Role not found' },
          '409': { description: 'Role code or name already exists' },
        },
      },
      delete: {
        summary: 'Delete role',
        tags: ['Roles'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Role deleted successfully' },
          '403': { description: 'Cannot delete system roles' },
          '404': { description: 'Role not found' },
          '409': { description: 'Cannot delete role with assigned users' },
        },
      },
    },
    '/api/roles/{id}/permissions': {
      get: {
        summary: 'Get all permissions for a role',
        tags: ['Roles'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Role with permissions' },
          '404': { description: 'Role not found' },
        },
      },
      post: {
        summary: 'Assign permissions to a role',
        tags: ['Roles'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['permissionIds'],
                properties: {
                  permissionIds: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Permissions assigned successfully' },
          '400': { description: 'Validation error' },
          '404': { description: 'Role or permission not found' },
        },
      },
      put: {
        summary: 'Sync permissions for a role',
        tags: ['Roles'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['permissionIds'],
                properties: {
                  permissionIds: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Permissions synced successfully' },
          '400': { description: 'Validation error' },
          '404': { description: 'Role or permission not found' },
        },
      },
      delete: {
        summary: 'Remove permissions from a role',
        tags: ['Roles'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['permissionIds'],
                properties: {
                  permissionIds: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Permissions removed successfully' },
          '400': { description: 'Validation error' },
          '404': { description: 'Role not found' },
        },
      },
    },
    '/api/permissions': {
      get: {
        summary: 'Get all permissions',
        tags: ['Permissions'],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'resource', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['name', 'resource', 'action', 'category', 'createdAt'] } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
        ],
        responses: {
          '200': { description: 'List of permissions' },
        },
      },
      post: {
        summary: 'Create a new permission',
        tags: ['Permissions'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['resource', 'action'],
                properties: {
                  name: { type: 'string' },
                  resource: { type: 'string' },
                  action: { type: 'string' },
                  description: { type: 'string' },
                  category: { type: 'string', default: 'general' },
                  isActive: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Permission created successfully' },
          '400': { description: 'Validation error' },
          '409': { description: 'Permission already exists' },
        },
      },
    },
    '/api/permissions/{id}': {
      get: {
        summary: 'Get permission by ID',
        tags: ['Permissions'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Permission details' },
          '404': { description: 'Permission not found' },
        },
      },
      put: {
        summary: 'Update permission',
        tags: ['Permissions'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  resource: { type: 'string' },
                  action: { type: 'string' },
                  description: { type: 'string' },
                  category: { type: 'string' },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Permission updated successfully' },
          '400': { description: 'Validation error' },
          '404': { description: 'Permission not found' },
          '409': { description: 'Permission name or resource/action combination already exists' },
        },
      },
      delete: {
        summary: 'Delete permission',
        tags: ['Permissions'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Permission deleted successfully' },
          '404': { description: 'Permission not found' },
        },
      },
    },
    '/api/permissions/meta': {
      get: {
        summary: 'Get permission metadata',
        tags: ['Permissions'],
        responses: {
          '200': {
            description: 'Permission metadata',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    categories: { type: 'array', items: { type: 'string' } },
                    resources: { type: 'array', items: { type: 'string' } },
                    defaultCategories: { type: 'object' },
                    defaultActions: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
