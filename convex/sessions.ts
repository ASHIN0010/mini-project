import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const startStudySession = mutation({
  args: {
    subjectId: v.optional(v.id("subjects")),
    topicId: v.optional(v.id("topics")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const sessionId = await ctx.db.insert("studySessions", {
      userId,
      subjectId: args.subjectId,
      topicId: args.topicId,
      startTime: Date.now(),
      interactionCount: 0,
      breaksCount: 0,
      completed: false,
    });

    return sessionId;
  },
});

export const updateSessionActivity = mutation({
  args: {
    sessionId: v.id("studySessions"),
    interactionCount: v.optional(v.number()),
    focusLevel: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    fatigueLevel: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found or access denied");
    }

    const updates: any = {};
    if (args.interactionCount !== undefined) {
      updates.interactionCount = args.interactionCount;
    }
    if (args.focusLevel !== undefined) {
      updates.focusLevel = args.focusLevel;
    }
    if (args.fatigueLevel !== undefined) {
      updates.fatigueLevel = args.fatigueLevel;
    }

    await ctx.db.patch(args.sessionId, updates);
    return args.sessionId;
  },
});

export const endStudySession = mutation({
  args: {
    sessionId: v.id("studySessions"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found or access denied");
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - session.startTime) / (1000 * 60)); // minutes

    await ctx.db.patch(args.sessionId, {
      endTime,
      duration,
      completed: true,
      notes: args.notes,
    });

    return { sessionId: args.sessionId, duration };
  },
});

export const getActiveSession = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const activeSession = await ctx.db
      .query("studySessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("completed"), false))
      .first();

    return activeSession;
  },
});

export const getRecentSessions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const sessions = await ctx.db
      .query("studySessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("completed"), true))
      .order("desc")
      .take(args.limit || 10);

    return sessions;
  },
});

export const getStudyAnalytics = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const daysBack = args.days || 7;
    const startDate = Date.now() - (daysBack * 24 * 60 * 60 * 1000);

    const sessions = await ctx.db
      .query("studySessions")
      .withIndex("by_date", (q) => q.eq("userId", userId).gte("startTime", startDate))
      .filter((q) => q.eq(q.field("completed"), true))
      .collect();

    const totalSessions = sessions.length;
    const totalStudyTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const averageSessionLength = totalSessions > 0 ? totalStudyTime / totalSessions : 0;

    // Calculate daily breakdown
    const dailyStats = new Map();
    sessions.forEach(session => {
      const date = new Date(session.startTime).toDateString();
      if (!dailyStats.has(date)) {
        dailyStats.set(date, { sessions: 0, duration: 0 });
      }
      const stats = dailyStats.get(date);
      stats.sessions += 1;
      stats.duration += session.duration || 0;
    });

    // Focus and fatigue analysis
    const focusLevels = sessions.filter(s => s.focusLevel).map(s => s.focusLevel);
    const fatigueLevels = sessions.filter(s => s.fatigueLevel).map(s => s.fatigueLevel);

    return {
      totalSessions,
      totalStudyTime,
      averageSessionLength,
      dailyStats: Array.from(dailyStats.entries()).map(([date, stats]) => ({
        date,
        ...stats,
      })),
      focusDistribution: {
        high: focusLevels.filter(f => f === "high").length,
        medium: focusLevels.filter(f => f === "medium").length,
        low: focusLevels.filter(f => f === "low").length,
      },
      fatigueDistribution: {
        high: fatigueLevels.filter(f => f === "high").length,
        medium: fatigueLevels.filter(f => f === "medium").length,
        low: fatigueLevels.filter(f => f === "low").length,
      },
    };
  },
});
