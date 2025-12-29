import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return profile;
  },
});

export const createProfile = mutation({
  args: {
    name: v.string(),
    studyIntensity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    preferredDifficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("advanced")),
    dailyStudyHours: v.number(),
    breakFrequency: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) {
      throw new Error("Profile already exists");
    }

    const profileId = await ctx.db.insert("profiles", {
      userId,
      name: args.name,
      studyIntensity: args.studyIntensity,
      preferredDifficulty: args.preferredDifficulty,
      dailyStudyHours: args.dailyStudyHours,
      breakFrequency: args.breakFrequency,
      createdAt: Date.now(),
    });

    return profileId;
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    studyIntensity: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    preferredDifficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("advanced"))),
    dailyStudyHours: v.optional(v.number()),
    breakFrequency: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      throw new Error("Profile not found");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.studyIntensity !== undefined) updates.studyIntensity = args.studyIntensity;
    if (args.preferredDifficulty !== undefined) updates.preferredDifficulty = args.preferredDifficulty;
    if (args.dailyStudyHours !== undefined) updates.dailyStudyHours = args.dailyStudyHours;
    if (args.breakFrequency !== undefined) updates.breakFrequency = args.breakFrequency;

    await ctx.db.patch(profile._id, updates);
    return profile._id;
  },
});
