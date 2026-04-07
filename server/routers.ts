import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // User profile and professional features
  users: router({
    getProfile: protectedProcedure.query(({ ctx }) => db.getUserById(ctx.user.id)),
    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          bio: z.string().optional(),
          location: z.string().optional(),
          avatar_url: z.string().optional(),
          userType: z.enum(["client", "editor", "videographer"]).optional(),
        })
      )
      .mutation(({ ctx, input }) => db.updateUserProfile(ctx.user.id, input)),
    getPublicProfile: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(({ input }) => db.getUserById(input.userId)),
  }),

  // Professional profiles
  professionals: router({
    createProfile: protectedProcedure
      .input(
        z.object({
          specializations: z.array(z.string()).optional(),
          portfolio_urls: z.array(z.string()).optional(),
          hourly_rate: z.number().optional(),
          min_project_size: z.number().optional(),
          service_area_radius_km: z.number().optional(),
        })
      )
      .mutation(({ ctx, input }) => db.createProfessionalProfile(ctx.user.id, input)),
    getProfile: protectedProcedure.query(({ ctx }) => db.getProfessionalProfile(ctx.user.id)),
    updateProfile: protectedProcedure
      .input(
        z.object({
          specializations: z.array(z.string()).optional(),
          portfolio_urls: z.array(z.string()).optional(),
          hourly_rate: z.number().optional(),
          availability_status: z.enum(["available", "unavailable", "on_break"]).optional(),
        })
      )
      .mutation(({ ctx, input }) => db.updateProfessionalProfile(ctx.user.id, input)),
  }),

  // Orders and jobs
  orders: router({
    create: protectedProcedure
      .input(
        z.object({
          service_type: z.enum(["editing_only", "videography_only", "shoot_and_edit"]),
          editing_style: z.enum(["basic", "advanced", "premium"]).optional(),
          video_url: z.string().optional(),
          video_duration_seconds: z.number().optional(),
          instructions_text: z.string().optional(),
          delivery_time_hours: z.number(),
          price: z.number(),
          commission_amount: z.number(),
          professional_amount: z.number(),
        })
      )
      .mutation(({ ctx, input }) =>
        db.createOrder({
          client_id: ctx.user.id,
          status: "pending",
          deadline: new Date(Date.now() + input.delivery_time_hours * 60 * 60 * 1000),
          ...input,
        })
      ),
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
      .query(({ ctx, input }) => db.getClientOrders(ctx.user.id, input.limit, input.offset)),
    getById: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(({ input }) => db.getOrderById(input.orderId)),
    updateStatus: protectedProcedure
      .input(z.object({ orderId: z.number(), status: z.string() }))
      .mutation(({ input }) => db.updateOrderStatus(input.orderId, input.status)),
    getPendingJobs: protectedProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
      .query(({ input }) => db.getPendingOrders(input.limit, input.offset)),
    getEditorJobs: protectedProcedure
      .input(z.object({ status: z.string().optional() }))
      .query(({ ctx, input }) => db.getEditorJobs(ctx.user.id, input.status)),
    getVideographerBookings: protectedProcedure
      .input(z.object({ status: z.string().optional() }))
      .query(({ ctx, input }) => db.getVideographerBookings(ctx.user.id, input.status)),
    assignProfessional: protectedProcedure
      .input(
        z.object({
          orderId: z.number(),
          professionalId: z.number(),
          professionalType: z.enum(["editor", "videographer"]),
        })
      )
      .mutation(({ input }) =>
        db.assignProfessionalToOrder(input.orderId, input.professionalId, input.professionalType)
      ),
  }),

  // Payments
  payments: router({
    create: protectedProcedure
      .input(
        z.object({
          order_id: z.number(),
          amount: z.number(),
          payment_method: z.enum(["upi", "debit_card", "credit_card", "net_banking", "wallet", "cod"]),
          payment_gateway: z.enum(["razorpay", "stripe"]),
        })
      )
      .mutation(({ input }) =>
        db.createPayment({
          ...input,
          status: "pending",
          escrow_status: "held",
        })
      ),
    getByOrderId: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(({ input }) => db.getPaymentByOrderId(input.orderId)),
    updateStatus: protectedProcedure
      .input(z.object({ paymentId: z.number(), status: z.string(), transactionId: z.string().optional() }))
      .mutation(({ input }) => db.updatePaymentStatus(input.paymentId, input.status, input.transactionId)),
    getHistory: protectedProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
      .query(({ ctx, input }) => db.getUserPaymentHistory(ctx.user.id, input.limit, input.offset)),
  }),

  // Reviews and ratings
  reviews: router({
    create: protectedProcedure
      .input(
        z.object({
          order_id: z.number(),
          reviewee_id: z.number(),
          rating: z.number().min(1).max(5),
          comment: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        db.createReview({
          ...input,
          reviewer_id: ctx.user.id,
        })
      ),
    getByUser: publicProcedure
      .input(z.object({ userId: z.number(), limit: z.number().default(20), offset: z.number().default(0) }))
      .query(({ input }) => db.getUserReviews(input.userId, input.limit, input.offset)),
  }),

  // Chat messages
  chat: router({
    sendMessage: protectedProcedure
      .input(
        z.object({
          order_id: z.number(),
          receiver_id: z.number(),
          message_text: z.string().optional(),
          message_type: z.enum(["text", "file", "voice_note"]),
          file_url: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        db.createChatMessage({
          ...input,
          sender_id: ctx.user.id,
        })
      ),
    getMessages: protectedProcedure
      .input(z.object({ orderId: z.number(), limit: z.number().default(50), offset: z.number().default(0) }))
      .query(({ input }) => db.getOrderMessages(input.orderId, input.limit, input.offset)),
    markAsRead: protectedProcedure
      .input(z.object({ messageId: z.number() }))
      .mutation(({ input }) => db.markMessageAsRead(input.messageId)),
  }),

  // Notifications
  notifications: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
      .query(({ ctx, input }) => db.getUserNotifications(ctx.user.id, input.limit, input.offset)),
    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(({ input }) => db.markNotificationAsRead(input.notificationId)),
  }),

  // Deliverables
  deliverables: router({
    upload: protectedProcedure
      .input(
        z.object({
          order_id: z.number(),
          video_url: z.string(),
          video_duration_seconds: z.number(),
          file_size_mb: z.number(),
        })
      )
      .mutation(({ input }) => db.createDeliverable(input)),
    getByOrderId: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(({ input }) => db.getDeliverableByOrderId(input.orderId)),
    markAsDownloaded: protectedProcedure
      .input(z.object({ deliverableId: z.number() }))
      .mutation(({ input }) => db.markDeliverableAsDownloaded(input.deliverableId)),
  }),

  // Disputes
  disputes: router({
    create: protectedProcedure
      .input(
        z.object({
          order_id: z.number(),
          reason: z.string(),
        })
      )
      .mutation(({ ctx, input }) =>
        db.createDispute({
          ...input,
          initiator_id: ctx.user.id,
          status: "open",
        })
      ),
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
      .query(({ input }) => db.getOpenDisputes(input.limit, input.offset)),
    resolve: protectedProcedure
      .input(
        z.object({
          disputeId: z.number(),
          resolutionType: z.enum(["full_refund", "partial_refund", "no_refund", "custom"]),
          resolutionAmount: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(({ input }) =>
        db.resolveDispute(input.disputeId, input.resolutionType, input.resolutionAmount, input.notes)
      ),
  }),

  // Videographer availability
  availability: router({
    addSlot: protectedProcedure
      .input(
        z.object({
          date: z.string(),
          startTime: z.string(),
          endTime: z.string(),
        })
      )
      .mutation(({ ctx, input }) =>
        db.addAvailabilitySlot(ctx.user.id, input.date, input.startTime, input.endTime)
      ),
    getSlots: protectedProcedure
      .input(z.object({ date: z.string() }))
      .query(({ ctx, input }) => db.getVideographerAvailability(ctx.user.id, input.date)),
  }),

  // Admin features
  admin: router({
    getUserStats: protectedProcedure.query(() => db.getUserStats()),
    getOrderStats: protectedProcedure
      .input(z.object({ startDate: z.date(), endDate: z.date() }))
      .query(({ input }) => db.getOrderStats(input.startDate, input.endDate)),
    getPlatformSettings: protectedProcedure.query(() => db.getPlatformSettings()),
    updatePlatformSettings: protectedProcedure
      .input(
        z.object({
          commission_percentage: z.number().optional(),
          min_order_price: z.number().optional(),
          max_order_price: z.number().optional(),
        })
      )
      .mutation(({ input }) => db.updatePlatformSettings(input)),
  }),
});

export type AppRouter = typeof appRouter;
