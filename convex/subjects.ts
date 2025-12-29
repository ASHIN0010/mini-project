import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listSubjects = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const subjects = await ctx.db
      .query("subjects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return subjects.sort((a, b) => {
      // Sort by priority first, then by exam date
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (a.priority !== b.priority) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (a.examDate && b.examDate) {
        return a.examDate - b.examDate;
      }
      return a.createdAt - b.createdAt;
    });
  },
});

export const createSubject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    examDate: v.optional(v.number()),
    totalTopics: v.number(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const subjectId = await ctx.db.insert("subjects", {
      userId,
      name: args.name,
      description: args.description,
      difficulty: args.difficulty,
      examDate: args.examDate,
      totalTopics: args.totalTopics,
      completedTopics: 0,
      priority: args.priority,
      createdAt: Date.now(),
    });

    return subjectId;
  },
});

export const updateSubject = mutation({
  args: {
    subjectId: v.id("subjects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    difficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))),
    examDate: v.optional(v.number()),
    totalTopics: v.optional(v.number()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const subject = await ctx.db.get(args.subjectId);
    if (!subject || subject.userId !== userId) {
      throw new Error("Subject not found or access denied");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.difficulty !== undefined) updates.difficulty = args.difficulty;
    if (args.examDate !== undefined) updates.examDate = args.examDate;
    if (args.totalTopics !== undefined) updates.totalTopics = args.totalTopics;
    if (args.priority !== undefined) updates.priority = args.priority;

    await ctx.db.patch(args.subjectId, updates);
    return args.subjectId;
  },
});

export const deleteSubject = mutation({
  args: {
    subjectId: v.id("subjects"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const subject = await ctx.db.get(args.subjectId);
    if (!subject || subject.userId !== userId) {
      throw new Error("Subject not found or access denied");
    }

    // Delete related topics
    const topics = await ctx.db
      .query("topics")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .collect();

    for (const topic of topics) {
      await ctx.db.delete(topic._id);
    }

    await ctx.db.delete(args.subjectId);
    return args.subjectId;
  },
});

export const getSubjectProgress = query({
  args: {
    subjectId: v.id("subjects"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const subject = await ctx.db.get(args.subjectId);
    if (!subject || subject.userId !== userId) return null;

    const topics = await ctx.db
      .query("topics")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .collect();

    const completedTopics = topics.filter(t => t.completed).length;
    const totalTopics = topics.length;
    const averageMastery = topics.length > 0 
      ? topics.reduce((sum, t) => sum + t.masteryLevel, 0) / topics.length 
      : 0;

    return {
      subject,
      topics,
      completedTopics,
      totalTopics,
      progressPercentage: totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0,
      averageMastery,
    };
  },
});
