# ClipShift - Architecture & Database Schema

## Overview

ClipShift is a marketplace platform connecting Clients, Video Editors, and Videographers. This document defines the database schema, API endpoints, and system architecture.

---

## Database Schema

### 1. Users Table

Stores all user accounts with role-based access control.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| `password_hash` | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| `role` | ENUM | NOT NULL | Client, Editor, Videographer, Admin |
| `first_name` | VARCHAR(100) | NOT NULL | User's first name |
| `last_name` | VARCHAR(100) | NOT NULL | User's last name |
| `avatar_url` | TEXT | NULL | S3 URL to avatar image |
| `bio` | TEXT | NULL | User biography |
| `location` | VARCHAR(255) | NULL | City/region (required for Videographers) |
| `rating` | DECIMAL(3,2) | DEFAULT 0 | Average rating (0-5) |
| `total_reviews` | INT | DEFAULT 0 | Number of reviews received |
| `verified_badge` | BOOLEAN | DEFAULT FALSE | Professional verification status |
| `top_rated_badge` | BOOLEAN | DEFAULT FALSE | Top performer status |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account active status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last profile update |
| `deleted_at` | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes:** `email`, `role`, `rating`, `created_at`

---

### 2. Professional Profiles Table

Extended profile data for Editors and Videographers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique profile identifier |
| `user_id` | UUID | FOREIGN KEY (Users) | Reference to user |
| `specializations` | JSON | NULL | Array of specialization tags |
| `portfolio_urls` | JSON | NULL | Array of portfolio image/video URLs |
| `hourly_rate` | DECIMAL(10,2) | NULL | Price per hour (Editors) |
| `min_project_size` | INT | NULL | Minimum project duration in minutes |
| `availability_status` | ENUM | DEFAULT 'available' | Available, unavailable, on-break |
| `response_time_hours` | INT | DEFAULT 24 | Average response time |
| `completion_rate` | DECIMAL(5,2) | DEFAULT 0 | Percentage of completed jobs |
| `on_time_rate` | DECIMAL(5,2) | DEFAULT 0 | Percentage of on-time deliveries |
| `service_area_radius_km` | INT | NULL | Service area radius (Videographers) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Profile creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last profile update |

**Indexes:** `user_id`, `specializations`, `availability_status`, `hourly_rate`

---

### 3. Orders Table

Tracks all client orders and job assignments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique order identifier |
| `client_id` | UUID | FOREIGN KEY (Users) | Client who placed order |
| `editor_id` | UUID | FOREIGN KEY (Users) | Assigned editor (nullable) |
| `videographer_id` | UUID | FOREIGN KEY (Users) | Assigned videographer (nullable) |
| `service_type` | ENUM | NOT NULL | editing_only, videography_only, shoot_and_edit |
| `status` | ENUM | NOT NULL | pending, assigned, in_progress, completed, cancelled |
| `editing_style` | ENUM | NULL | basic, advanced, premium |
| `video_url` | TEXT | NULL | S3 URL to uploaded raw video |
| `video_duration_seconds` | INT | NULL | Duration of uploaded video |
| `instructions_text` | TEXT | NULL | Client instructions |
| `instructions_voice_url` | TEXT | NULL | S3 URL to voice note |
| `delivery_time_hours` | INT | NOT NULL | Requested delivery time (6, 12, or 24) |
| `price` | DECIMAL(10,2) | NOT NULL | Order total price |
| `commission_amount` | DECIMAL(10,2) | NOT NULL | Platform commission (20-30%) |
| `professional_amount` | DECIMAL(10,2) | NOT NULL | Amount paid to professional |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Order creation time |
| `assigned_at` | TIMESTAMP | NULL | Time professional was assigned |
| `started_at` | TIMESTAMP | NULL | Time work started |
| `completed_at` | TIMESTAMP | NULL | Time work completed |
| `deadline` | TIMESTAMP | NOT NULL | Delivery deadline |
| `revision_count` | INT | DEFAULT 0 | Number of revisions used |
| `revision_requested` | BOOLEAN | DEFAULT FALSE | Revision requested flag |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last status update |

**Indexes:** `client_id`, `editor_id`, `videographer_id`, `status`, `deadline`, `created_at`

---

### 4. Deliverables Table

Stores final videos and edited content.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique deliverable identifier |
| `order_id` | UUID | FOREIGN KEY (Orders) | Associated order |
| `video_url` | TEXT | NOT NULL | S3 URL to final video |
| `video_duration_seconds` | INT | NOT NULL | Duration of final video |
| `file_size_mb` | DECIMAL(10,2) | NOT NULL | File size in MB |
| `quality_metrics` | JSON | NULL | AI quality check results |
| `uploaded_at` | TIMESTAMP | NOT NULL | Upload timestamp |
| `downloaded_by_client` | BOOLEAN | DEFAULT FALSE | Download status |
| `downloaded_at` | TIMESTAMP | NULL | Download timestamp |

**Indexes:** `order_id`, `uploaded_at`

---

### 5. Payments Table

Tracks all payment transactions and escrow.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique payment identifier |
| `order_id` | UUID | FOREIGN KEY (Orders) | Associated order |
| `amount` | DECIMAL(10,2) | NOT NULL | Payment amount |
| `currency` | VARCHAR(3) | DEFAULT 'INR' | Currency code |
| `payment_method` | ENUM | NOT NULL | upi, debit_card, credit_card, net_banking, wallet, cod |
| `status` | ENUM | NOT NULL | pending, completed, failed, refunded |
| `transaction_id` | VARCHAR(255) | UNIQUE | Payment gateway transaction ID |
| `payment_gateway` | ENUM | NOT NULL | razorpay, stripe |
| `escrow_status` | ENUM | NOT NULL | held, released, refunded |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Payment creation time |
| `completed_at` | TIMESTAMP | NULL | Payment completion time |
| `refunded_at` | TIMESTAMP | NULL | Refund timestamp |
| `metadata` | JSON | NULL | Additional payment data |

**Indexes:** `order_id`, `status`, `transaction_id`, `created_at`

---

### 6. Reviews Table

Stores ratings and reviews for professionals and clients.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique review identifier |
| `order_id` | UUID | FOREIGN KEY (Orders) | Associated order |
| `reviewer_id` | UUID | FOREIGN KEY (Users) | User who wrote review |
| `reviewee_id` | UUID | FOREIGN KEY (Users) | User being reviewed |
| `rating` | INT | NOT NULL | Rating 1-5 |
| `comment` | TEXT | NULL | Review comment |
| `categories` | JSON | NULL | Category-specific ratings (communication, quality, timeliness) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Review creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:** `reviewee_id`, `reviewer_id`, `order_id`, `created_at`

---

### 7. Chat Messages Table

Stores real-time chat between clients and professionals.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique message identifier |
| `order_id` | UUID | FOREIGN KEY (Orders) | Associated order |
| `sender_id` | UUID | FOREIGN KEY (Users) | Message sender |
| `receiver_id` | UUID | FOREIGN KEY (Users) | Message receiver |
| `message_text` | TEXT | NULL | Message content |
| `message_type` | ENUM | NOT NULL | text, file, voice_note |
| `file_url` | TEXT | NULL | S3 URL to attached file |
| `voice_note_url` | TEXT | NULL | S3 URL to voice note |
| `is_read` | BOOLEAN | DEFAULT FALSE | Read status |
| `read_at` | TIMESTAMP | NULL | Read timestamp |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Message creation time |

**Indexes:** `order_id`, `sender_id`, `receiver_id`, `created_at`, `is_read`

---

### 8. Notifications Table

Stores user notifications for orders, messages, and system events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique notification identifier |
| `user_id` | UUID | FOREIGN KEY (Users) | Recipient user |
| `type` | ENUM | NOT NULL | order_assigned, message_received, job_completed, payment_received, etc. |
| `title` | VARCHAR(255) | NOT NULL | Notification title |
| `body` | TEXT | NOT NULL | Notification body |
| `related_order_id` | UUID | FOREIGN KEY (Orders) | Associated order (if applicable) |
| `is_read` | BOOLEAN | DEFAULT FALSE | Read status |
| `read_at` | TIMESTAMP | NULL | Read timestamp |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Notification creation time |

**Indexes:** `user_id`, `type`, `is_read`, `created_at`

---

### 9. Disputes Table

Tracks order disputes and resolutions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique dispute identifier |
| `order_id` | UUID | FOREIGN KEY (Orders) | Associated order |
| `initiator_id` | UUID | FOREIGN KEY (Users) | User who initiated dispute |
| `reason` | TEXT | NOT NULL | Dispute reason |
| `status` | ENUM | NOT NULL | open, resolved, closed |
| `resolution_type` | ENUM | NULL | full_refund, partial_refund, no_refund, custom |
| `resolution_amount` | DECIMAL(10,2) | NULL | Refund amount if applicable |
| `admin_notes` | TEXT | NULL | Admin resolution notes |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Dispute creation time |
| `resolved_at` | TIMESTAMP | NULL | Resolution timestamp |

**Indexes:** `order_id`, `initiator_id`, `status`, `created_at`

---

### 10. Videographer Availability Table

Stores availability slots for videographers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique availability identifier |
| `videographer_id` | UUID | FOREIGN KEY (Users) | Videographer user |
| `date` | DATE | NOT NULL | Available date |
| `start_time` | TIME | NOT NULL | Start time (HH:MM) |
| `end_time` | TIME | NOT NULL | End time (HH:MM) |
| `is_available` | BOOLEAN | DEFAULT TRUE | Availability status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |

**Indexes:** `videographer_id`, `date`, `is_available`

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register new user (email + password) |
| `POST` | `/api/auth/signin` | Login user (email + password) |
| `POST` | `/api/auth/google-login` | Google OAuth login |
| `POST` | `/api/auth/refresh-token` | Refresh JWT token |
| `POST` | `/api/auth/logout` | Logout user |
| `POST` | `/api/auth/forgot-password` | Request password reset |
| `POST` | `/api/auth/reset-password` | Reset password with token |

---

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users/profile` | Get current user profile |
| `PUT` | `/api/users/profile` | Update user profile |
| `POST` | `/api/users/avatar-upload` | Upload user avatar |
| `GET` | `/api/users/:id` | Get user public profile |
| `GET` | `/api/users/:id/reviews` | Get user reviews |
| `POST` | `/api/users/role-selection` | Select user role (Client/Editor/Videographer) |

---

### Order Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/orders/create` | Create new order |
| `GET` | `/api/orders` | List user's orders (paginated) |
| `GET` | `/api/orders/:id` | Get order details |
| `PUT` | `/api/orders/:id/status` | Update order status |
| `POST` | `/api/orders/:id/upload-video` | Upload raw video |
| `POST` | `/api/orders/:id/cancel` | Cancel order |
| `POST` | `/api/orders/:id/request-revision` | Request revision |

---

### Professional Matching Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/matching/search-editors` | Search and match editors |
| `GET` | `/api/matching/search-videographers` | Search and match videographers |
| `GET` | `/api/matching/recommendations/:orderId` | Get AI-matched professionals |
| `POST` | `/api/matching/accept-job` | Professional accepts job |
| `POST` | `/api/matching/reject-job` | Professional rejects job |

---

### Deliverable Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/deliverables/:orderId/upload` | Upload edited video |
| `GET` | `/api/deliverables/:orderId` | Get deliverable details |
| `POST` | `/api/deliverables/:orderId/download` | Download final video |

---

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payments/create-order` | Create payment order |
| `POST` | `/api/payments/verify` | Verify payment with gateway |
| `GET` | `/api/payments/:orderId` | Get payment details |
| `POST` | `/api/payments/:id/refund` | Initiate refund |
| `GET` | `/api/payments/history` | Get user payment history |

---

### Chat Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/chat/conversations` | List user conversations |
| `GET` | `/api/chat/:orderId/messages` | Get messages for order |
| `POST` | `/api/chat/:orderId/send` | Send message |
| `POST` | `/api/chat/:orderId/upload-file` | Upload file to chat |
| `PUT` | `/api/chat/:messageId/read` | Mark message as read |

---

### Review Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/reviews/create` | Submit review |
| `GET` | `/api/reviews/:userId` | Get user reviews |
| `PUT` | `/api/reviews/:id` | Update review |
| `DELETE` | `/api/reviews/:id` | Delete review |

---

### AI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/detect-style` | Analyze video and suggest editing style |
| `POST` | `/api/ai/calculate-price` | Calculate order price based on parameters |
| `POST` | `/api/ai/quality-check` | Analyze video quality (blur, audio, lighting) |
| `POST` | `/api/ai/match-professionals` | Get AI-matched professionals |
| `POST` | `/api/ai/improve-instructions` | Improve user instructions with AI |

---

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/dashboard` | Get admin dashboard metrics |
| `GET` | `/api/admin/users` | List all users (paginated, filterable) |
| `PUT` | `/api/admin/users/:id/approve` | Approve professional |
| `PUT` | `/api/admin/users/:id/suspend` | Suspend user account |
| `DELETE` | `/api/admin/users/:id` | Delete user |
| `GET` | `/api/admin/orders` | List all orders (filterable) |
| `GET` | `/api/admin/payments` | List all payments (filterable) |
| `GET` | `/api/admin/disputes` | List open disputes |
| `POST` | `/api/admin/disputes/:id/resolve` | Resolve dispute |
| `GET` | `/api/admin/analytics` | Get analytics data |
| `PUT` | `/api/admin/settings` | Update platform settings |

---

## WebSocket Events (Real-Time Chat)

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `message:send` | Client → Server | `{orderId, text, type}` | Send message |
| `message:receive` | Server → Client | `{id, sender, text, timestamp}` | Receive message |
| `typing:start` | Client → Server | `{orderId}` | User started typing |
| `typing:stop` | Client → Server | `{orderId}` | User stopped typing |
| `typing:indicator` | Server → Client | `{userId}` | Show typing indicator |
| `message:read` | Client → Server | `{messageId}` | Mark message as read |
| `notification:new` | Server → Client | `{type, title, body}` | New notification |

---

## Authentication & Security

### JWT Token Structure

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "client",
  "iat": 1704067200,
  "exp": 1704153600
}
```

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Rate Limiting

- Authentication endpoints: 5 requests per minute per IP
- API endpoints: 100 requests per minute per user
- File uploads: 10 MB per file, 100 MB per day per user

---

## Error Handling

All API responses follow this format:

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { ... }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | User not authenticated |
| `FORBIDDEN` | 403 | User lacks permission |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Data Validation Rules

### Video Upload

- Supported formats: MP4, MOV
- Maximum file size: 500 MB
- Maximum duration: 60 minutes
- Minimum resolution: 720p

### Order Creation

- Video duration: 1 minute to 60 minutes
- Delivery time: 6, 12, or 24 hours
- Editing style: basic, advanced, or premium
- Price range: ₹500 to ₹50,000

### Professional Profiles

- Hourly rate: ₹500 to ₹10,000
- Response time: 1 to 72 hours
- Service area radius: 1 to 100 km

---

## Scalability Considerations

1. **Database:** Use PostgreSQL with read replicas for scaling reads
2. **Caching:** Redis for session management and frequently accessed data
3. **File Storage:** AWS S3 with CloudFront CDN for video delivery
4. **Real-Time Chat:** Use WebSocket server with horizontal scaling (Redis pub/sub)
5. **Background Jobs:** Use Bull/RabbitMQ for async tasks (email, notifications, AI processing)
6. **Load Balancing:** Use Nginx or AWS ALB for distributing traffic

---

## Next Steps

1. Implement database migrations using Drizzle ORM
2. Build authentication and user management APIs
3. Create order and job management endpoints
4. Integrate payment gateway (Razorpay)
5. Set up WebSocket server for real-time chat
6. Implement AI features using OpenAI API
7. Build admin panel with analytics
8. Create mobile app screens and connect to APIs
