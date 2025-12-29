import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listTopicsBySubject = query({
  args: {
    subjectId: v.id("subjects"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const topics = await ctx.db
      .query("topics")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .collect();

    return topics.filter(t => t.userId === userId);
  },
});

export const createTopic = mutation({
  args: {
    subjectId: v.id("subjects"),
    name: v.string(),
    description: v.optional(v.string()),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    estimatedHours: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify subject ownership
    const subject = await ctx.db.get(args.subjectId);
    if (!subject || subject.userId !== userId) {
      throw new Error("Subject not found or access denied");
    }

    const topicId = await ctx.db.insert("topics", {
      subjectId: args.subjectId,
      userId,
      name: args.name,
      description: args.description,
      difficulty: args.difficulty,
      estimatedHours: args.estimatedHours,
      completed: false,
      masteryLevel: 0,
      createdAt: Date.now(),
    });

    return topicId;
  },
});

export const updateTopicProgress = mutation({
  args: {
    topicId: v.id("topics"),
    completed: v.optional(v.boolean()),
    masteryLevel: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const topic = await ctx.db.get(args.topicId);
    if (!topic || topic.userId !== userId) {
      throw new Error("Topic not found or access denied");
    }

    const updates: any = {
      lastStudied: Date.now(),
    };

    if (args.completed !== undefined) {
      updates.completed = args.completed;
    }
    if (args.masteryLevel !== undefined) {
      updates.masteryLevel = Math.max(0, Math.min(100, args.masteryLevel));
    }

    await ctx.db.patch(args.topicId, updates);

    // Update subject completion count
    if (args.completed !== undefined) {
      const subject = await ctx.db.get(topic.subjectId);
      if (subject) {
        const allTopics = await ctx.db
          .query("topics")
          .withIndex("by_subject", (q) => q.eq("subjectId", topic.subjectId))
          .collect();

        const completedCount = allTopics.filter(t => 
          t._id === args.topicId ? args.completed : t.completed
        ).length;

        await ctx.db.patch(topic.subjectId, {
          completedTopics: completedCount,
        });
      }
    }

    return args.topicId;
  },
});

export const deleteTopic = mutation({
  args: {
    topicId: v.id("topics"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const topic = await ctx.db.get(args.topicId);
    if (!topic || topic.userId !== userId) {
      throw new Error("Topic not found or access denied");
    }

    await ctx.db.delete(args.topicId);

    // Update subject completion count
    const subject = await ctx.db.get(topic.subjectId);
    if (subject) {
      const remainingTopics = await ctx.db
        .query("topics")
        .withIndex("by_subject", (q) => q.eq("subjectId", topic.subjectId))
        .collect();

      const completedCount = remainingTopics.filter(t => t.completed).length;

      await ctx.db.patch(topic.subjectId, {
        completedTopics: completedCount,
      });
    }

    return args.topicId;
  },
});
