import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // User profiles with study preferences
  profiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    studyIntensity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    preferredDifficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("advanced")),
    dailyStudyHours: v.number(),
    breakFrequency: v.number(), // minutes between breaks
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Subjects and syllabus
  subjects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    examDate: v.optional(v.number()),
    totalTopics: v.number(),
    completedTopics: v.number(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_exam_date", ["userId", "examDate"]),

  // Study topics within subjects
  topics: defineTable({
    subjectId: v.id("subjects"),
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    estimatedHours: v.number(),
    completed: v.boolean(),
    lastStudied: v.optional(v.number()),
    masteryLevel: v.number(), // 0-100
    createdAt: v.number(),
  }).index("by_subject", ["subjectId"])
    .index("by_user", ["userId"])
    .index("by_completion", ["userId", "completed"]),

  // Study sessions for behavioral tracking
  studySessions: defineTable({
    userId: v.id("users"),
    subjectId: v.optional(v.id("subjects")),
    topicId: v.optional(v.id("topics")),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    duration: v.optional(v.number()), // minutes
    focusLevel: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    fatigueLevel: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    interactionCount: v.number(),
    breaksCount: v.number(),
    completed: v.boolean(),
    notes: v.optional(v.string()),
  }).index("by_user", ["userId"])
    .index("by_date", ["userId", "startTime"]),

  // AI-generated quizzes
  quizzes: defineTable({
    userId: v.id("users"),
    subjectId: v.id("subjects"),
    topicId: v.optional(v.id("topics")),
    title: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    questions: v.array(v.object({
      question: v.string(),
      options: v.array(v.string()),
      correctAnswer: v.number(),
      explanation: v.string(),
    })),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_subject", ["subjectId"]),

  // Quiz attempts and results
  quizAttempts: defineTable({
    userId: v.id("users"),
    quizId: v.id("quizzes"),
    score: v.number(),
    totalQuestions: v.number(),
    timeSpent: v.number(), // seconds
    answers: v.array(v.object({
      questionIndex: v.number(),
      selectedAnswer: v.number(),
      correct: v.boolean(),
    })),
    completedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_quiz", ["quizId"]),

  // Study plans and schedules
  studyPlans: defineTable({
    userId: v.id("users"),
    name: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    subjects: v.array(v.id("subjects")),
    dailySchedule: v.array(v.object({
      date: v.number(),
      sessions: v.array(v.object({
        subjectId: v.id("subjects"),
        topicId: v.optional(v.id("topics")),
        startTime: v.string(), // HH:MM format
        duration: v.number(), // minutes
        type: v.union(v.literal("study"), v.literal("review"), v.literal("quiz")),
      })),
    })),
    active: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_active", ["userId", "active"]),

  // PDF documents and notes
  documents: defineTable({
    userId: v.id("users"),
    subjectId: v.optional(v.id("subjects")),
    title: v.string(),
    fileId: v.id("_storage"),
    summary: v.optional(v.string()),
    keyPoints: v.optional(v.array(v.string())),
    generatedQuestions: v.optional(v.array(v.string())),
    uploadedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_subject", ["subjectId"]),

  // Chat conversations with AI
  conversations: defineTable({
    userId: v.id("users"),
    subjectId: v.optional(v.id("subjects")),
    messages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
      timestamp: v.number(),
    })),
    context: v.optional(v.object({
      currentTopic: v.optional(v.string()),
      difficulty: v.optional(v.string()),
      fatigueLevel: v.optional(v.string()),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Behavioral analytics
  behaviorMetrics: defineTable({
    userId: v.id("users"),
    date: v.number(),
    totalStudyTime: v.number(), // minutes
    sessionsCount: v.number(),
    averageFocusLevel: v.number(),
    averageFatigueLevel: v.number(),
    breaksCount: v.number(),
    quizzesCompleted: v.number(),
    averageQuizScore: v.number(),
    topicsCompleted: v.number(),
    consistencyScore: v.number(), // 0-100
  }).index("by_user", ["userId"])
    .index("by_date", ["userId", "date"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
