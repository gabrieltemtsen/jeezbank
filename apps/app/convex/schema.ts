import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // End users
  users: defineTable({
    phone: v.string(),
    name: v.optional(v.string()),
    bvn: v.optional(v.string()),
    nin: v.optional(v.string()),
    // FuseCore references
    fusecoreCustomerId: v.optional(v.string()),
    fusecoreAccountId: v.optional(v.string()),
    virtualAccountNumber: v.optional(v.string()),
    // KYC
    kycTier: v.number(), // 0=unverified, 1=basic, 2=full
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_phone", ["phone"]),

  // OTP codes for phone auth
  otps: defineTable({
    phone: v.string(),
    code: v.string(),
    expiresAt: v.number(),
    used: v.boolean(),
  }).index("by_phone", ["phone"]),
});
