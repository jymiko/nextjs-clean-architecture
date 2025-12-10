export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Gacoan DCMS API',
    version: '1.0.4',
    description: 'API documentation for Gacoan Document Control Management System with JWT authentication',
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
      SystemBranding: {
        type: 'object',
        properties: {
          systemName: { type: 'string', example: 'Gacoan DCMS' },
          systemDescription: { type: 'string', example: 'A Document Control Management System built with Next.js' },
          logo: { type: 'string', nullable: true, description: 'Logo URL or base64 data' },
          primaryColor: { type: 'string', example: '#3b82f6', description: 'Primary brand color in hex format' },
          secondaryColor: { type: 'string', example: '#1e40af', description: 'Secondary brand color in hex format' },
          favicon: { type: 'string', nullable: true, description: 'Favicon URL or base64 data' }
        }
      },
      BrandingUpdateRequest: {
        type: 'object',
        properties: {
          systemName: { type: 'string', minLength: 1, maxLength: 100, description: 'System name' },
          systemDescription: { type: 'string', maxLength: 500, description: 'System description' },
          logo: { type: 'string', nullable: true, description: 'Logo URL or base64 data' },
          primaryColor: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$', description: 'Primary color in hex format (e.g., #3b82f6)' },
          secondaryColor: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$', description: 'Secondary color in hex format (e.g., #1e40af)' },
          favicon: { type: 'string', nullable: true, description: 'Favicon URL or base64 data' }
        }
      },
      MediaUploadRequest: {
        type: 'object',
        properties: {
          logo: { type: 'string', description: 'Logo file as base64 or multipart form data' },
          favicon: { type: 'string', description: 'Favicon file as base64 or multipart form data' }
        }
      },
    },
  },
  // Global security (can be overridden at endpoint level)
  // security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Authentication', description: 'Authentication endpoints' },
    { name: 'Profile', description: 'User profile management endpoints (self-service)' },
    { name: 'Users', description: 'User management endpoints (admin)' },
    { name: 'Departments', description: 'Department management endpoints' },
    { name: 'Positions', description: 'Position management endpoints' },
    { name: 'Roles', description: 'Role management endpoints' },
    { name: 'Permissions', description: 'Permission management endpoints' },
    { name: 'System', description: 'System branding and configuration endpoints (admin)' },
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
        description: 'Retrieve a paginated list of users with optional filtering and sorting',
        tags: ['Users'],
        security: [], // Public endpoint
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number for pagination' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Number of items per page' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by name or email' },
          { name: 'roleId', in: 'query', schema: { type: 'string' }, description: 'Filter by role ID' },
          { name: 'departmentId', in: 'query', schema: { type: 'string' }, description: 'Filter by department ID' },
          { name: 'positionId', in: 'query', schema: { type: 'string' }, description: 'Filter by position ID' },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' }, description: 'Filter by active status' },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['name', 'email', 'employeeId', 'createdAt'] }, description: 'Field to sort by' },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] }, description: 'Sort order' },
        ],
        responses: {
          '200': {
            description: 'List of users',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/PaginatedResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/User' }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          '400': { description: 'Bad request' },
        },
      },
      post: {
        summary: 'Create a new user',
        description: 'Create a new user account. Requires admin privileges.',
        tags: ['Users'],
        security: [{ bearerAuth: [] }], // Requires authentication
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                  employeeId: { type: 'string', description: 'Unique employee identifier' },
                  name: { type: 'string', minLength: 3, maxLength: 100, description: 'Full name' },
                  email: { type: 'string', format: 'email', description: 'Email address' },
                  password: { type: 'string', minLength: 6, description: 'Password (will be hashed)' },
                  roleId: { type: 'string', description: 'Role ID to assign' },
                  departmentId: { type: 'string', description: 'Department ID to assign' },
                  positionId: { type: 'string', description: 'Position ID to assign' },
                  isActive: { type: 'boolean', default: true, description: 'Account status' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          '400': { description: 'Validation error' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Admin access required' },
          '409': { description: 'Email or employee ID already exists' },
        },
      },
    },
    '/api/users/{id}': {
      get: {
        summary: 'Get user by ID',
        description: 'Retrieve detailed information about a specific user',
        tags: ['Users'],
        security: [], // Public endpoint
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'User ID' }],
        responses: {
          '200': {
            description: 'User details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          '404': { description: 'User not found' },
        },
      },
      put: {
        summary: 'Update user',
        description: 'Update user information. Requires admin privileges.',
        tags: ['Users'],
        security: [{ bearerAuth: [] }], // Requires authentication
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'User ID' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  employeeId: { type: 'string', description: 'Unique employee identifier' },
                  name: { type: 'string', minLength: 3, maxLength: 100, description: 'Full name' },
                  email: { type: 'string', format: 'email', description: 'Email address' },
                  password: { type: 'string', minLength: 6, description: 'New password (if changing)' },
                  roleId: { type: 'string', description: 'Role ID to assign' },
                  departmentId: { type: 'string', description: 'Department ID to assign' },
                  positionId: { type: 'string', description: 'Position ID to assign' },
                  avatar: { type: 'string', description: 'Avatar URL' },
                  signature: { type: 'string', description: 'Base64 encoded signature image' },
                  isActive: { type: 'boolean', description: 'Account status' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'User updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          },
          '400': { description: 'Validation error' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Admin access required' },
          '404': { description: 'User not found' },
          '409': { description: 'Email or employee ID already taken' },
        },
      },
      delete: {
        summary: 'Delete user',
        description: 'Delete a user account. Requires admin privileges.',
        tags: ['Users'],
        security: [{ bearerAuth: [] }], // Requires authentication
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'User ID' }],
        responses: {
          '200': {
            description: 'User deleted successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' }
              }
            }
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Admin access required' },
          '404': { description: 'User not found' },
        },
      },
    },
    '/api/departments': {
      get: {
        summary: 'Get all departments',
        description: 'Retrieve a paginated list of departments with optional filtering and sorting',
        tags: ['Departments'],
        security: [], // Public endpoint
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number for pagination' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Number of items per page' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by name or code' },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' }, description: 'Filter by active status' },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['name', 'code', 'createdAt'] }, description: 'Field to sort by' },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] }, description: 'Sort order' },
        ],
        responses: {
          '200': {
            description: 'List of departments',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/PaginatedResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Department' }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          '400': { description: 'Bad request' },
        },
      },
      post: {
        summary: 'Create a new department',
        description: 'Create a new department. Requires admin privileges.',
        tags: ['Departments'],
        security: [{ bearerAuth: [] }], // Requires authentication
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'name'],
                properties: {
                  code: { type: 'string', minLength: 2, maxLength: 10, description: 'Unique department code' },
                  name: { type: 'string', minLength: 3, maxLength: 100, description: 'Department name' },
                  description: { type: 'string', maxLength: 255, description: 'Department description' },
                  headOfDepartmentId: { type: 'string', description: 'ID of the department head' },
                  isActive: { type: 'boolean', default: true, description: 'Department status' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Department created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Department' }
              }
            }
          },
          '400': { description: 'Validation error' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Admin access required' },
          '409': { description: 'Department code or name already exists' },
        },
      },
    },
    '/api/departments/{id}': {
      get: {
        summary: 'Get department by ID',
        description: 'Retrieve detailed information about a specific department',
        tags: ['Departments'],
        security: [], // Public endpoint
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Department ID' }],
        responses: {
          '200': {
            description: 'Department details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Department' }
              }
            }
          },
          '404': { description: 'Department not found' },
        },
      },
      put: {
        summary: 'Update department',
        description: 'Update department information. Requires admin privileges.',
        tags: ['Departments'],
        security: [{ bearerAuth: [] }], // Requires authentication
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Department ID' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  code: { type: 'string', minLength: 2, maxLength: 10, description: 'Unique department code' },
                  name: { type: 'string', minLength: 3, maxLength: 100, description: 'Department name' },
                  description: { type: 'string', maxLength: 255, description: 'Department description' },
                  headOfDepartmentId: { type: 'string', description: 'ID of the department head' },
                  isActive: { type: 'boolean', description: 'Department status' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Department updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Department' }
              }
            }
          },
          '400': { description: 'Validation error' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Admin access required' },
          '404': { description: 'Department not found' },
          '409': { description: 'Department code or name already exists' },
        },
      },
      delete: {
        summary: 'Delete department',
        description: 'Delete a department. Requires admin privileges.',
        tags: ['Departments'],
        security: [{ bearerAuth: [] }], // Requires authentication
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Department ID' }],
        responses: {
          '200': {
            description: 'Department deleted successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' }
              }
            }
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Admin access required' },
          '404': { description: 'Department not found' },
          '409': { description: 'Cannot delete department with assigned employees or positions' },
        },
      },
    },
    '/api/positions': {
      get: {
        summary: 'Get all positions',
        description: 'Retrieve a paginated list of positions with optional filtering and sorting',
        tags: ['Positions'],
        security: [], // Public endpoint
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number for pagination' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Number of items per page' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by name or code' },
          { name: 'departmentId', in: 'query', schema: { type: 'string' }, description: 'Filter by department ID' },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' }, description: 'Filter by active status' },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['name', 'code', 'level', 'createdAt'] }, description: 'Field to sort by' },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] }, description: 'Sort order' },
        ],
        responses: {
          '200': {
            description: 'List of positions',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/PaginatedResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Position' }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          '400': { description: 'Bad request' },
        },
      },
      post: {
        summary: 'Create a new position',
        description: 'Create a new position. Requires admin privileges.',
        tags: ['Positions'],
        security: [{ bearerAuth: [] }], // Requires authentication
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'name'],
                properties: {
                  code: { type: 'string', minLength: 2, maxLength: 10, description: 'Unique position code' },
                  name: { type: 'string', minLength: 3, maxLength: 100, description: 'Position name' },
                  description: { type: 'string', maxLength: 255, description: 'Position description' },
                  departmentId: { type: 'string', description: 'Department ID this position belongs to' },
                  level: { type: 'integer', minimum: 1, maximum: 10, default: 1, description: 'Position level (hierarchy)' },
                  isActive: { type: 'boolean', default: true, description: 'Position status' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Position created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Position' }
              }
            }
          },
          '400': { description: 'Validation error' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Admin access required' },
          '409': { description: 'Position code already exists' },
        },
      },
    },
    '/api/positions/{id}': {
      get: {
        summary: 'Get position by ID',
        description: 'Retrieve detailed information about a specific position',
        tags: ['Positions'],
        security: [], // Public endpoint
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Position ID' }],
        responses: {
          '200': {
            description: 'Position details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Position' }
              }
            }
          },
          '404': { description: 'Position not found' },
        },
      },
      put: {
        summary: 'Update position',
        description: 'Update position information. Requires admin privileges.',
        tags: ['Positions'],
        security: [{ bearerAuth: [] }], // Requires authentication
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Position ID' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  code: { type: 'string', minLength: 2, maxLength: 10, description: 'Unique position code' },
                  name: { type: 'string', minLength: 3, maxLength: 100, description: 'Position name' },
                  description: { type: 'string', maxLength: 255, description: 'Position description' },
                  departmentId: { type: 'string', description: 'Department ID this position belongs to' },
                  level: { type: 'integer', minimum: 1, maximum: 10, description: 'Position level (hierarchy)' },
                  isActive: { type: 'boolean', description: 'Position status' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Position updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Position' }
              }
            }
          },
          '400': { description: 'Validation error' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Admin access required' },
          '404': { description: 'Position not found' },
          '409': { description: 'Position code already exists' },
        },
      },
      delete: {
        summary: 'Delete position',
        description: 'Delete a position. Requires admin privileges.',
        tags: ['Positions'],
        security: [{ bearerAuth: [] }], // Requires authentication
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Position ID' }],
        responses: {
          '200': {
            description: 'Position deleted successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' }
              }
            }
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Admin access required' },
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
        description: 'Retrieve a paginated list of permissions with optional filtering and sorting',
        tags: ['Permissions'],
        security: [], // Public endpoint
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number for pagination' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Number of items per page' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by name' },
          { name: 'resource', in: 'query', schema: { type: 'string' }, description: 'Filter by resource' },
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category' },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' }, description: 'Filter by active status' },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['name', 'resource', 'action', 'category', 'createdAt'] }, description: 'Field to sort by' },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] }, description: 'Sort order' },
        ],
        responses: {
          '200': {
            description: 'List of permissions',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/PaginatedResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Permission' }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          '400': { description: 'Bad request' },
        },
      },
      post: {
        summary: 'Create a new permission',
        description: 'Create a new permission. Requires admin privileges.',
        tags: ['Permissions'],
        security: [{ bearerAuth: [] }], // Requires authentication
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['resource', 'action'],
                properties: {
                  name: { type: 'string', maxLength: 100, description: 'Permission name (auto-generated if not provided)' },
                  resource: { type: 'string', maxLength: 50, description: 'Resource this permission applies to' },
                  action: { type: 'string', enum: ['create', 'read', 'update', 'delete', 'manage'], description: 'Action allowed' },
                  description: { type: 'string', maxLength: 255, description: 'Permission description' },
                  category: { type: 'string', maxLength: 50, default: 'general', description: 'Permission category' },
                  isActive: { type: 'boolean', default: true, description: 'Permission status' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Permission created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Permission' }
              }
            }
          },
          '400': { description: 'Validation error' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Admin access required' },
          '409': { description: 'Permission already exists' },
        },
      },
    },
    '/api/permissions/{id}': {
      get: {
        summary: 'Get permission by ID',
        description: 'Retrieve detailed information about a specific permission',
        tags: ['Permissions'],
        security: [], // Public endpoint
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Permission ID' }],
        responses: {
          '200': {
            description: 'Permission details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Permission' }
              }
            }
          },
          '404': { description: 'Permission not found' },
        },
      },
      put: {
        summary: 'Update permission',
        description: 'Update permission information. Requires admin privileges.',
        tags: ['Permissions'],
        security: [{ bearerAuth: [] }], // Requires authentication
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Permission ID' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', maxLength: 100, description: 'Permission name' },
                  resource: { type: 'string', maxLength: 50, description: 'Resource this permission applies to' },
                  action: { type: 'string', enum: ['create', 'read', 'update', 'delete', 'manage'], description: 'Action allowed' },
                  description: { type: 'string', maxLength: 255, description: 'Permission description' },
                  category: { type: 'string', maxLength: 50, description: 'Permission category' },
                  isActive: { type: 'boolean', description: 'Permission status' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Permission updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Permission' }
              }
            }
          },
          '400': { description: 'Validation error' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Admin access required' },
          '404': { description: 'Permission not found' },
          '409': { description: 'Permission name or resource/action combination already exists' },
        },
      },
      delete: {
        summary: 'Delete permission',
        description: 'Delete a permission. Requires admin privileges.',
        tags: ['Permissions'],
        security: [{ bearerAuth: [] }], // Requires authentication
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Permission ID' }],
        responses: {
          '200': {
            description: 'Permission deleted successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' }
              }
            }
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Admin access required' },
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
    '/api/system/branding': {
      get: {
        summary: 'Get system branding settings',
        description: 'Retrieve current system branding configuration including name, description, logo, and colors.',
        tags: ['System'],
        security: [{ bearerAuth: [] }], // Requires authentication
        responses: {
          '200': {
            description: 'System branding settings retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SystemBranding' }
              }
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Admin access required' },
        },
      },
      put: {
        summary: 'Update system branding settings',
        description: 'Update system branding configuration. Requires admin privileges.',
        tags: ['System'],
        security: [{ bearerAuth: [] }], // Requires authentication
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BrandingUpdateRequest' }
            },
          },
        },
        responses: {
          '200': {
            description: 'Branding updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Branding updated successfully' },
                    data: { $ref: '#/components/schemas/SystemBranding' }
                  },
                },
              },
            },
          },
          '400': { description: 'Validation error' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Admin access required' },
        },
      },
      post: {
        summary: 'Upload branding media',
        description: 'Upload logo or favicon files for system branding. Requires admin privileges.',
        tags: ['System'],
        security: [{ bearerAuth: [] }], // Requires authentication
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MediaUploadRequest' }
            },
          },
        },
        responses: {
          '200': {
            description: 'Media uploaded successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Media uploaded successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        logo: { type: 'string', nullable: true },
                        favicon: { type: 'string', nullable: true }
                      }
                    }
                  },
                },
              },
            },
          },
          '400': { description: 'Validation error or file upload failed' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Admin access required' },
        },
      },
    },
  },
};
