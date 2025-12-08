# Database Schema Documentation

## Overview

This database schema is designed for a Point of Sale (POS) system that handles restaurant orders, menu management, and payment processing. The schema follows a clean architecture pattern with proper separation of concerns.

## Entity Relationship Diagram (ERD)

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    User     │◄──────┤     Order    ├──────►│ OrderItem   │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)      │       │ id (PK)     │
│ email       │       │ orderNumber  │       │ orderId     │
│ name        │       │ customerName │       │ menuItemId  │
│ password    │       │ orderType    │       │ quantity    │
│ role        │       │ status       │       │ unitPrice   │
│ createdAt   │       │ totalAmount  │       │ totalPrice  │
│ updatedAt   │       │ staffId (FK) │       └─────────────┘
└─────────────┘       └──────────────┘              │
      ▲                        ▲                   │
      │                        │                   ▼
      │                        │           ┌─────────────┐
      │                        │           │ MenuItem    │
      │                        │           ├─────────────┤
      │                        │           │ id (PK)     │
      │                        │           │ name        │
      │                        │           │ price       │
      │                        │           │ categoryId  │
      │                        │           │ isAvailable │
      │                        │           └─────────────┘
      │                        │                   ▲
      │                        │                   │
      ▼                        ▼                   │
┌─────────────┐       ┌──────────────┐              │
│   Session   │       │   Payment    │              │
├─────────────┤       ├──────────────┤              │
│ id (PK)     │       │ id (PK)      │              │
│ userId      │       │ orderId      │              │
│ token       │       │ amount       │              │
│ expiresAt   │       │ paymentMethod│              │
│ createdAt   │       │ status       │              │
└─────────────┘       └──────────────┘              │
                                                  │
┌─────────────┐                          ┌─────────────┐
│  Category   │                          │  Inventory  │
├─────────────┤                          ├─────────────┤
│ id (PK)     │                          │ id (PK)     │
│ name        │                          │ menuItemId  │
│ description │                          │ stock       │
│ displayOrder│                          │ minStock    │
│ isActive    │                          │ unit        │
└─────────────┘                          └─────────────┘
```

## Tables Description

### 1. Users Table
**Purpose**: Stores user authentication and authorization data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | Primary Key | Unique identifier |
| email | String | Unique | User's email address |
| name | String | Not Null | User's full name |
| password | String? | Nullable | Hashed password |
| role | UserRole | Default: STAFF | User role (ADMIN, MANAGER, STAFF) |
| createdAt | DateTime | Default: now() | Account creation timestamp |
| updatedAt | DateTime | Auto update | Last update timestamp |

**Enums**:
- `UserRole`: ADMIN, MANAGER, STAFF

### 2. Sessions Table
**Purpose**: Manages user authentication sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | Primary Key | Unique identifier |
| userId | String | Foreign Key | Reference to users.id |
| token | String | Unique | Session token |
| expiresAt | DateTime | Not Null | Session expiration time |
| createdAt | DateTime | Default: now() | Session creation timestamp |

### 3. Categories Table
**Purpose**: Organizes menu items into categories.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | Primary Key | Unique identifier |
| name | String | Unique | Category name |
| description | String? | Nullable | Category description |
| displayOrder | Int | Default: 0 | Order of display |
| isActive | Boolean | Default: true | Whether category is active |
| createdAt | DateTime | Default: now() | Creation timestamp |
| updatedAt | DateTime | Auto update | Last update timestamp |

### 4. Menu Items Table
**Purpose**: Stores individual food and drink items.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | Primary Key | Unique identifier |
| name | String | Not Null | Item name |
| description | String? | Nullable | Item description |
| price | Decimal | Not Null | Item price |
| categoryId | String | Foreign Key | Reference to categories.id |
| imageUrl | String? | Nullable | URL of item image |
| isAvailable | Boolean | Default: true | Availability status |
| preparationTime | Int? | Nullable | Preparation time in minutes |
| nutritionalInfo | Json? | Nullable | Nutritional information |
| createdAt | DateTime | Default: now() | Creation timestamp |
| updatedAt | DateTime | Auto update | Last update timestamp |

### 5. Orders Table
**Purpose**: Stores customer orders.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | Primary Key | Unique identifier |
| orderNumber | String | Unique | Human-readable order number |
| customerName | String? | Nullable | Customer's name |
| customerEmail | String? | Nullable | Customer's email |
| customerPhone | String? | Nullable | Customer's phone |
| tableNumber | String? | Nullable | Table number for dine-in |
| orderType | OrderType | Default: DINE_IN | Type of order |
| status | OrderStatus | Default: PENDING | Current order status |
| subtotal | Decimal | Not Null | Order subtotal |
| taxAmount | Decimal | Default: 0 | Tax amount |
| discountAmount | Decimal | Default: 0 | Discount amount |
| totalAmount | Decimal | Not Null | Total order amount |
| paymentStatus | PaymentStatus | Default: PENDING | Payment status |
| paymentMethod | String? | Nullable | Payment method used |
| notes | String? | Nullable | Order notes |
| staffId | String | Foreign Key | Reference to users.id |
| createdAt | DateTime | Default: now() | Order creation time |
| updatedAt | DateTime | Auto update | Last update timestamp |

**Enums**:
- `OrderType`: DINE_IN, TAKEAWAY, DELIVERY
- `OrderStatus`: PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED
- `PaymentStatus`: PENDING, PAID, REFUNDED, PARTIALLY_REFUNDED

### 6. Order Items Table
**Purpose**: Stores line items for each order.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | Primary Key | Unique identifier |
| orderId | String | Foreign Key | Reference to orders.id |
| menuItemId | String | Foreign Key | Reference to menu_items.id |
| quantity | Int | Not Null | Item quantity |
| unitPrice | Decimal | Not Null | Price per unit |
| totalPrice | Decimal | Not Null | Total price for this item |
| specialRequest | String? | Nullable | Special customer requests |
| createdAt | DateTime | Default: now() | Creation timestamp |

### 7. Payments Table
**Purpose**: Tracks payment transactions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | Primary Key | Unique identifier |
| orderId | String | Foreign Key | Reference to orders.id |
| amount | Decimal | Not Null | Payment amount |
| paymentMethod | PaymentMethod | Not Null | Payment method type |
| paymentDetails | Json? | Nullable | Gateway response data |
| status | PaymentStatus | Not Null | Payment status |
| paidAt | DateTime? | Nullable | Payment completion time |
| createdAt | DateTime | Default: now() | Creation timestamp |

**Enums**:
- `PaymentMethod`: CASH, CREDIT_CARD, DEBIT_CARD, EWALLET, BANK_TRANSFER, QR_CODE

### 8. Tables Table
**Purpose**: Manages restaurant tables for dine-in service.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | Primary Key | Unique identifier |
| number | String | Unique | Table number |
| capacity | Int | Not Null | Number of seats |
| isAvailable | Boolean | Default: true | Availability status |
| location | String? | Nullable | Table location |
| createdAt | DateTime | Default: now() | Creation timestamp |
| updatedAt | DateTime | Auto update | Last update timestamp |

### 9. Inventory Table
**Purpose**: Tracks stock levels for menu items.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | Primary Key | Unique identifier |
| menuItemId | String | Foreign Key, Unique | Reference to menu_items.id |
| stock | Int | Default: 0 | Current stock level |
| minStock | Int | Default: 10 | Minimum stock before alert |
| unit | String | Default: "pcs" | Unit of measurement |
| lastUpdated | DateTime | Default: now() | Last stock update |

### 10. Transaction Logs Table
**Purpose**: Audit trail for system events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | Primary Key | Unique identifier |
| orderId | String? | Nullable | Related order ID |
| type | String | Not Null | Event type |
| description | String | Not Null | Event description |
| metadata | Json? | Nullable | Additional event data |
| userId | String? | Nullable | User who performed action |
| createdAt | DateTime | Default: now() | Event timestamp |

## Relationships

1. **User to Session**: One-to-Many (A user can have multiple sessions)
2. **User to Order**: One-to-Many (A staff can handle multiple orders)
3. **Category to MenuItem**: One-to-Many (A category has many menu items)
4. **MenuItem to OrderItem**: One-to-Many (A menu item can be in many orders)
5. **MenuItem to Inventory**: One-to-One (Each menu item has one inventory record)
6. **Order to OrderItem**: One-to-Many (An order has many items)
7. **Order to Payment**: One-to-Many (An order can have multiple payments)

## Sample Data for Menu Categories

Based on the menu image, here are sample categories and menu items:

### Categories
```sql
INSERT INTO Category (id, name, displayOrder) VALUES
('cat-food', 'Makanan', 1),
('cat-drinks', 'Minuman', 2);
```

### Menu Items (Makanan)
```sql
INSERT INTO MenuItem (id, name, price, categoryId) VALUES
('food-1', 'Nasi Goreng', 25000, 'cat-food'),
('food-2', 'Mie Goreng', 22000, 'cat-food'),
('food-3', 'Ayam Bakar', 35000, 'cat-food'),
('food-4', 'Sate Ayam', 40000, 'cat-food'),
('food-5', 'Gado-Gado', 20000, 'cat-food'),
('food-6', 'Rendang', 45000, 'cat-food');
```

### Menu Items (Minuman)
```sql
INSERT INTO MenuItem (id, name, price, categoryId) VALUES
('drink-1', 'Es Teh Manis', 8000, 'cat-drinks'),
('drink-2', 'Teh Hangat', 6000, 'cat-drinks'),
('drink-3', 'Es Jeruk', 10000, 'cat-drinks'),
('drink-4', 'Jus Alpukat', 15000, 'cat-drinks'),
('drink-5', 'Kopi Hitam', 10000, 'cat-drinks'),
('drink-6', 'Air Mineral', 5000, 'cat-drinks');
```

## Best Practices

1. **Indexing**: Add indexes on frequently queried columns like:
   - `orders.orderNumber`
   - `orders.status`
   - `order_items.orderId`
   - `menu_items.categoryId`
   - `menu_items.isAvailable`

2. **Data Validation**:
   - Ensure price values are always positive
   - Validate email formats
   - Check stock levels before creating orders

3. **Security**:
   - Always hash passwords before storing
   - Use prepared statements to prevent SQL injection
   - Implement proper role-based access control

4. **Performance**:
   - Consider database partitioning for large order tables
   - Use connection pooling for better performance
   - Implement caching for frequently accessed menu data

5. **Audit Trail**:
   - Log all critical operations (order changes, payments, refunds)
   - Include user context in all audit logs
   - Maintain immutable logs for compliance

## Migration Notes

When migrating from an existing system:

1. **Data Mapping**: Ensure proper mapping of existing menu categories
2. **Price Conversion**: Handle currency conversion if needed
3. **User Migration**: Preserve existing user credentials
4. **Order History**: Migrate complete order history with all details
5. **Inventory Sync**: Ensure inventory levels are accurately transferred