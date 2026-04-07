import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  date,
  time,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with ClipShift-specific fields for marketplace functionality.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // ClipShift user type
  userType: mysqlEnum("userType", ["client", "editor", "videographer"]),
  // Profile fields
  avatar_url: text("avatar_url"),
  bio: text("bio"),
  location: varchar("location", { length: 255 }),
  // Rating system
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  total_reviews: int("total_reviews").default(0),
  verified_badge: boolean("verified_badge").default(false),
  top_rated_badge: boolean("top_rated_badge").default(false),
  // Account status
  is_active: boolean("is_active").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  deleted_at: timestamp("deleted_at"),
});

/**
 * Professional profiles for Editors and Videographers
 */
export const professionalProfiles = mysqlTable("professional_profiles", {
  id: int("id").autoincrement().primaryKey(),
  user_id: int("user_id").notNull(),
  // Specializations and portfolio
  specializations: json("specializations"), // Array of strings
  portfolio_urls: json("portfolio_urls"), // Array of URLs
  // Pricing and availability
  hourly_rate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  min_project_size: int("min_project_size"), // In minutes
  availability_status: mysqlEnum("availability_status", ["available", "unavailable", "on_break"]).default("available"),
  response_time_hours: int("response_time_hours").default(24),
  // Performance metrics
  completion_rate: decimal("completion_rate", { precision: 5, scale: 2 }).default("0"),
  on_time_rate: decimal("on_time_rate", { precision: 5, scale: 2 }).default("0"),
  // For videographers
  service_area_radius_km: int("service_area_radius_km"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Orders table - tracks all client orders and job assignments
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  client_id: int("client_id").notNull(),
  editor_id: int("editor_id"),
  videographer_id: int("videographer_id"),
  // Service details
  service_type: mysqlEnum("service_type", ["editing_only", "videography_only", "shoot_and_edit"]).notNull(),
  status: mysqlEnum("status", ["pending", "assigned", "in_progress", "completed", "cancelled"]).notNull(),
  editing_style: mysqlEnum("editing_style", ["basic", "advanced", "premium"]),
  // Video and instructions
  video_url: text("video_url"),
  video_duration_seconds: int("video_duration_seconds"),
  instructions_text: text("instructions_text"),
  instructions_voice_url: text("instructions_voice_url"),
  // Delivery and pricing
  delivery_time_hours: int("delivery_time_hours").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  commission_amount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  professional_amount: decimal("professional_amount", { precision: 10, scale: 2 }).notNull(),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  assigned_at: timestamp("assigned_at"),
  started_at: timestamp("started_at"),
  completed_at: timestamp("completed_at"),
  deadline: timestamp("deadline").notNull(),
  // Revisions
  revision_count: int("revision_count").default(0),
  revision_requested: boolean("revision_requested").default(false),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Deliverables - stores final videos and edited content
 */
export const deliverables = mysqlTable("deliverables", {
  id: int("id").autoincrement().primaryKey(),
  order_id: int("order_id").notNull(),
  video_url: text("video_url").notNull(),
  video_duration_seconds: int("video_duration_seconds").notNull(),
  file_size_mb: decimal("file_size_mb", { precision: 10, scale: 2 }).notNull(),
  quality_metrics: json("quality_metrics"), // AI quality check results
  uploaded_at: timestamp("uploaded_at").notNull(),
  downloaded_by_client: boolean("downloaded_by_client").default(false),
  downloaded_at: timestamp("downloaded_at"),
});

/**
 * Payments table - tracks all payment transactions and escrow
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  order_id: int("order_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("INR"),
  payment_method: mysqlEnum("payment_method", ["upi", "debit_card", "credit_card", "net_banking", "wallet", "cod"]).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).notNull(),
  transaction_id: varchar("transaction_id", { length: 255 }).unique(),
  payment_gateway: mysqlEnum("payment_gateway", ["razorpay", "stripe"]).notNull(),
  escrow_status: mysqlEnum("escrow_status", ["held", "released", "refunded"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completed_at: timestamp("completed_at"),
  refunded_at: timestamp("refunded_at"),
  metadata: json("metadata"), // Additional payment data
});

/**
 * Reviews table - stores ratings and reviews for professionals and clients
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  order_id: int("order_id").notNull(),
  reviewer_id: int("reviewer_id").notNull(),
  reviewee_id: int("reviewee_id").notNull(),
  rating: int("rating").notNull(), // 1-5
  comment: text("comment"),
  categories: json("categories"), // Category-specific ratings
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Chat messages - stores real-time chat between clients and professionals
 */
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  order_id: int("order_id").notNull(),
  sender_id: int("sender_id").notNull(),
  receiver_id: int("receiver_id").notNull(),
  message_text: text("message_text"),
  message_type: mysqlEnum("message_type", ["text", "file", "voice_note"]).notNull(),
  file_url: text("file_url"),
  voice_note_url: text("voice_note_url"),
  is_read: boolean("is_read").default(false),
  read_at: timestamp("read_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Notifications - stores user notifications for orders, messages, and system events
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  user_id: int("user_id").notNull(),
  type: mysqlEnum("type", [
    "order_assigned",
    "message_received",
    "job_completed",
    "payment_received",
    "review_received",
    "job_request",
    "order_status_update",
    "dispute_resolved",
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  related_order_id: int("related_order_id"),
  is_read: boolean("is_read").default(false),
  read_at: timestamp("read_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Disputes - tracks order disputes and resolutions
 */
export const disputes = mysqlTable("disputes", {
  id: int("id").autoincrement().primaryKey(),
  order_id: int("order_id").notNull(),
  initiator_id: int("initiator_id").notNull(),
  reason: text("reason").notNull(),
  status: mysqlEnum("status", ["open", "resolved", "closed"]).notNull(),
  resolution_type: mysqlEnum("resolution_type", ["full_refund", "partial_refund", "no_refund", "custom"]),
  resolution_amount: decimal("resolution_amount", { precision: 10, scale: 2 }),
  admin_notes: text("admin_notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolved_at: timestamp("resolved_at"),
});

/**
 * Videographer availability - stores availability slots for videographers
 */
export const videographerAvailability = mysqlTable("videographer_availability", {
  id: int("id").autoincrement().primaryKey(),
  videographer_id: int("videographer_id").notNull(),
  date: date("date").notNull(),
  start_time: time("start_time").notNull(),
  end_time: time("end_time").notNull(),
  is_available: boolean("is_available").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Platform settings - for admin configuration
 */
export const platformSettings = mysqlTable("platform_settings", {
  id: int("id").autoincrement().primaryKey(),
  commission_percentage: decimal("commission_percentage", { precision: 5, scale: 2 }).default("25"),
  min_order_price: decimal("min_order_price", { precision: 10, scale: 2 }).default("500"),
  max_order_price: decimal("max_order_price", { precision: 10, scale: 2 }).default("50000"),
  default_delivery_hours: json("default_delivery_hours"), // [6, 12, 24]
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type ProfessionalProfile = typeof professionalProfiles.$inferSelect;
export type InsertProfessionalProfile = typeof professionalProfiles.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export type Deliverable = typeof deliverables.$inferSelect;
export type InsertDeliverable = typeof deliverables.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export type Dispute = typeof disputes.$inferSelect;
export type InsertDispute = typeof disputes.$inferInsert;

export type VideographerAvailability = typeof videographerAvailability.$inferSelect;
export type InsertVideographerAvailability = typeof videographerAvailability.$inferInsert;

export type PlatformSettings = typeof platformSettings.$inferSelect;
export type InsertPlatformSettings = typeof platformSettings.$inferInsert;
