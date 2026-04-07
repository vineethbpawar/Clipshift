import { eq, and, or, desc, asc, gte, lte, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  orders,
  payments,
  reviews,
  chatMessages,
  notifications,
  professionalProfiles,
  deliverables,
  disputes,
  videographerAvailability,
  platformSettings,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
}

export async function updateUserProfile(userId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, userId));
}

// ============================================================================
// PROFESSIONAL PROFILE FUNCTIONS
// ============================================================================

export async function createProfessionalProfile(userId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(professionalProfiles).values({
    user_id: userId,
    ...data,
  });

  return (result as any).insertId;
}

export async function getProfessionalProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(professionalProfiles).where(eq(professionalProfiles.user_id, userId)).limit(1);
  return result[0] || null;
}

export async function updateProfessionalProfile(userId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(professionalProfiles).set({ ...data, updatedAt: new Date() }).where(eq(professionalProfiles.user_id, userId));
}

// ============================================================================
// ORDER FUNCTIONS
// ============================================================================

export async function createOrder(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(orders).values(data);
  return (result as any).insertId;
}

export async function getOrderById(orderId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return result[0] || null;
}

export async function getClientOrders(clientId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(orders)
    .where(eq(orders.client_id, clientId))
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getEditorJobs(editorId: number, status?: string) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(orders.editor_id, editorId)];
  if (status) {
    conditions.push(eq(orders.status, status as any));
  }

  return db.select().from(orders).where(and(...conditions)).orderBy(desc(orders.createdAt));
}

export async function getVideographerBookings(videographerId: number, status?: string) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(orders.videographer_id, videographerId)];
  if (status) {
    conditions.push(eq(orders.status, status as any));
  }

  return db.select().from(orders).where(and(...conditions)).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(orderId: number, status: string, updates?: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const data: any = { status, updatedAt: new Date() };
  if (status === "assigned") {
    data.assigned_at = new Date();
  } else if (status === "in_progress") {
    data.started_at = new Date();
  } else if (status === "completed") {
    data.completed_at = new Date();
  }

  if (updates) {
    Object.assign(data, updates);
  }

  await db.update(orders).set(data).where(eq(orders.id, orderId));
}

export async function assignProfessionalToOrder(orderId: number, professionalId: number, professionalType: "editor" | "videographer") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const data: any = {
    status: "assigned",
    assigned_at: new Date(),
    updatedAt: new Date(),
  };

  if (professionalType === "editor") {
    data.editor_id = professionalId;
  } else {
    data.videographer_id = professionalId;
  }

  await db.update(orders).set(data).where(eq(orders.id, orderId));
}

export async function getPendingOrders(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(orders)
    .where(eq(orders.status, "pending"))
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);
}

// ============================================================================
// PAYMENT FUNCTIONS
// ============================================================================

export async function createPayment(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(payments).values(data);
  return (result as any).insertId;
}

export async function getPaymentByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(payments).where(eq(payments.order_id, orderId)).limit(1);
  return result[0] || null;
}

export async function updatePaymentStatus(paymentId: number, status: string, transactionId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const data: any = { status };
  if (status === "completed") {
    data.completed_at = new Date();
  } else if (status === "refunded") {
    data.refunded_at = new Date();
  }
  if (transactionId) {
    data.transaction_id = transactionId;
  }

  await db.update(payments).set(data).where(eq(payments.id, paymentId));
}

export async function getUserPaymentHistory(userId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(payments)
    .innerJoin(orders, eq(payments.order_id, orders.id))
    .where(eq(orders.client_id, userId))
    .orderBy(desc(payments.createdAt))
    .limit(limit)
    .offset(offset);
}

// ============================================================================
// REVIEW FUNCTIONS
// ============================================================================

export async function createReview(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(reviews).values(data);

  // Update user rating
  const avgRating = await db
    .select()
    .from(reviews)
    .where(eq(reviews.reviewee_id, data.reviewee_id));

  if (avgRating.length > 0) {
    const avg = avgRating.reduce((sum, r) => sum + r.rating, 0) / avgRating.length;
    await db.update(users).set({ rating: avg as any, total_reviews: avgRating.length }).where(eq(users.id, data.reviewee_id));
  }

  return (result as any).insertId;
}

export async function getUserReviews(userId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(reviews)
    .where(eq(reviews.reviewee_id, userId))
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);
}

// ============================================================================
// CHAT MESSAGE FUNCTIONS
// ============================================================================

export async function createChatMessage(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(chatMessages).values(data);
  return (result as any).insertId;
}

export async function getOrderMessages(orderId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.order_id, orderId))
    .orderBy(asc(chatMessages.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function markMessageAsRead(messageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(chatMessages).set({ is_read: true, read_at: new Date() }).where(eq(chatMessages.id, messageId));
}

// ============================================================================
// NOTIFICATION FUNCTIONS
// ============================================================================

export async function createNotification(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(notifications).values(data);
  return (result as any).insertId;
}

export async function getUserNotifications(userId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.user_id, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(notifications).set({ is_read: true, read_at: new Date() }).where(eq(notifications.id, notificationId));
}

// ============================================================================
// DELIVERABLE FUNCTIONS
// ============================================================================

export async function createDeliverable(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(deliverables).values(data);
  return (result as any).insertId;
}

export async function getDeliverableByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(deliverables).where(eq(deliverables.order_id, orderId)).limit(1);
  return result[0] || null;
}

export async function markDeliverableAsDownloaded(deliverableId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(deliverables)
    .set({ downloaded_by_client: true, downloaded_at: new Date() })
    .where(eq(deliverables.id, deliverableId));
}

// ============================================================================
// DISPUTE FUNCTIONS
// ============================================================================

export async function createDispute(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(disputes).values(data);
  return (result as any).insertId;
}

export async function getOpenDisputes(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(disputes)
    .where(eq(disputes.status, "open"))
    .orderBy(desc(disputes.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function resolveDispute(disputeId: number, resolutionType: string, resolutionAmount?: number, notes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(disputes)
    .set({
      status: "resolved",
      resolution_type: resolutionType as any,
      resolution_amount: resolutionAmount as any,
      admin_notes: notes,
      resolved_at: new Date(),
    })
    .where(eq(disputes.id, disputeId));
}

// ============================================================================
// VIDEOGRAPHER AVAILABILITY FUNCTIONS
// ============================================================================

export async function addAvailabilitySlot(videographerId: number, date: string, startTime: string, endTime: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(videographerAvailability).values({
    videographer_id: videographerId,
    date: date as any,
    start_time: startTime as any,
    end_time: endTime as any,
  });

  return (result as any).insertId;
}

export async function getVideographerAvailability(videographerId: number, date: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(videographerAvailability)
    .where(and(eq(videographerAvailability.videographer_id, videographerId), eq(videographerAvailability.date, date as any)));
}

// ============================================================================
// PLATFORM SETTINGS FUNCTIONS
// ============================================================================

export async function getPlatformSettings() {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(platformSettings).limit(1);
  return result[0] || null;
}

export async function updatePlatformSettings(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(platformSettings).limit(1);

  if (existing.length > 0) {
    await db.update(platformSettings).set({ ...data, updatedAt: new Date() }).where(eq(platformSettings.id, existing[0].id));
  } else {
    await db.insert(platformSettings).values(data);
  }
}

// ============================================================================
// ANALYTICS FUNCTIONS
// ============================================================================

export async function getOrderStats(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return null;

  const completedOrders = await db
    .select()
    .from(orders)
    .where(and(eq(orders.status, "completed"), gte(orders.completed_at, startDate), lte(orders.completed_at, endDate)));

  const totalRevenue = completedOrders.reduce((sum, order) => sum + parseFloat(order.price.toString()), 0);

  return {
    totalOrders: completedOrders.length,
    totalRevenue,
    averageOrderValue: completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0,
  };
}

export async function getUserStats() {
  const db = await getDb();
  if (!db) return null;

  const clients = await db.select().from(users).where(eq(users.userType, "client"));
  const editors = await db.select().from(users).where(eq(users.userType, "editor"));
  const videographers = await db.select().from(users).where(eq(users.userType, "videographer"));

  return {
    totalClients: clients.length,
    totalEditors: editors.length,
    totalVideographers: videographers.length,
    totalUsers: clients.length + editors.length + videographers.length,
  };
}
