import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Admin users
  adminUsers: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("MANAGER"), v.literal("OFFICER"), v.literal("CUSTOMER_CARE")),
    name: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  // Audit log for admin actions
  auditLog: defineTable({
    adminId: v.string(),
    adminEmail: v.string(),
    action: v.string(),
    target: v.optional(v.string()),
    details: v.optional(v.string()),
    createdAt: v.number(),
  }),
});
