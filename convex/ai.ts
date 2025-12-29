import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

async function callOpenAI(prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    });
    
    return response.choices[0].message.content || "I apologize, but I couldn't generate a response.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate AI response");
  }
}

export const explainConcept = action({
  args: {
    topic: v.string(),
    subject: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("advanced")),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const difficultyPrompts = {
      easy: "Explain this concept in simple terms with basic examples, suitable for beginners",
      medium: "Provide a detailed explanation with practical examples and some technical depth",
      advanced: "Give an in-depth, comprehensive explanation with complex examples and technical details"
    };

    const prompt = `
You are an expert tutor for ${args.subject}. ${difficultyPrompts[args.difficulty]}.

Topic: ${args.topic}
${args.context ? `Additional Context: ${args.context}` : ''}

Please provide:
1. A clear explanation of the concept
2. Key points to remember
3. Practical examples
4. Common misconceptions to avoid
5. Tips for better understanding

Format your response in a structured, easy-to-read manner.
`;

    const explanation = await callOpenAI(prompt);
    return explanation;
  },
});

export const generateQuiz = action({
  args: {
    subject: v.string(),
    topic: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    questionCount: v.number(),
  },
  handler: async (ctx, args) => {
    const prompt = `
You are a quiz generator for ${args.subject}. Create ${args.questionCount} multiple-choice questions about "${args.topic}" at ${args.difficulty} difficulty level.

For each question, provide:
1. A clear, specific question
2. 4 multiple choice options (A, B, C, D)
3. The correct answer (0-3 for A-D)
4. A brief explanation of why the answer is correct

Format your response as a JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Explanation of the correct answer"
  }
]

Make sure questions test understanding, not just memorization. Include a mix of conceptual and application-based questions.
Return ONLY the JSON array, no other text.
`;

    const response = await callOpenAI(prompt);
    
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        // If no JSON found, try to parse the entire response
        const questions = JSON.parse(response);
        return questions;
      }
      
      const questions = JSON.parse(jsonMatch[0]);
      return questions;
    } catch (error) {
      console.error("Failed to parse quiz JSON:", error);
      // Return a fallback question if parsing fails
      return [{
        question: `What is an important concept in ${args.topic}?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: 0,
        explanation: "This is a sample question. Please try generating the quiz again."
      }];
    }
  },
});

export const chatWithAI = action({
  args: {
    message: v.string(),
    subject: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    fatigueLevel: v.optional(v.string()),
    conversationHistory: v.optional(v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
    }))),
  },
  handler: async (ctx, args) => {
    const contextInfo = [];
    if (args.subject) contextInfo.push(`Subject: ${args.subject}`);
    if (args.difficulty) contextInfo.push(`Preferred difficulty: ${args.difficulty}`);
    if (args.fatigueLevel) contextInfo.push(`Current fatigue level: ${args.fatigueLevel}`);

    let conversationContext = "";
    if (args.conversationHistory && args.conversationHistory.length > 0) {
      conversationContext = "\n\nPrevious conversation:\n" + 
        args.conversationHistory.slice(-6).map(msg => 
          `${msg.role === "user" ? "Student" : "Tutor"}: ${msg.content}`
        ).join("\n");
    }

    const fatigueAdjustment = args.fatigueLevel === "high" 
      ? "\n\nNote: The student seems tired. Keep your response concise and encouraging. Suggest a break if appropriate."
      : "";

    const prompt = `
You are an intelligent AI tutor and study companion. You help students learn effectively while being mindful of their well-being.

${contextInfo.length > 0 ? `Context: ${contextInfo.join(", ")}` : ""}
${conversationContext}
${fatigueAdjustment}

Student's message: ${args.message}

Respond as a helpful, encouraging tutor. Provide clear explanations, ask follow-up questions when appropriate, and adapt your teaching style to the student's needs. If the student seems confused, break down concepts into simpler parts. If they seem tired, be supportive and suggest healthy study practices.
`;

    const response = await callOpenAI(prompt);
    return response;
  },
});

export const analyzePDF = action({
  args: {
    text: v.string(),
    subject: v.string(),
  },
  handler: async (ctx, args) => {
    const prompt = `
You are an AI study assistant. Analyze the following text from a ${args.subject} document and provide:

1. A concise summary (2-3 paragraphs)
2. Key concepts and definitions (bullet points)
3. Important formulas or principles (if any)
4. 5 potential exam questions based on this content
5. Study tips for mastering this material

Text to analyze:
${args.text.substring(0, 4000)} ${args.text.length > 4000 ? "..." : ""}

Format your response clearly with headers for each section.
`;

    const analysis = await callOpenAI(prompt);
    return analysis;
  },
});

export const generateStudyPlan = action({
  args: {
    subjects: v.array(v.object({
      name: v.string(),
      difficulty: v.string(),
      examDate: v.optional(v.number()),
      topics: v.number(),
    })),
    dailyHours: v.number(),
    studyIntensity: v.string(),
  },
  handler: async (ctx, args) => {
    const subjectsInfo = args.subjects.map(s => 
      `${s.name} (${s.difficulty} difficulty, ${s.topics} topics${s.examDate ? `, exam: ${new Date(s.examDate).toLocaleDateString()}` : ''})`
    ).join("\n");

    const prompt = `
You are a study planning expert. Create a personalized study schedule based on:

Subjects:
${subjectsInfo}

Daily study time available: ${args.dailyHours} hours
Study intensity preference: ${args.studyIntensity}

Provide:
1. Priority ranking of subjects (consider difficulty and exam dates)
2. Recommended daily time allocation for each subject
3. Study sequence suggestions (which subjects to study when)
4. Break recommendations
5. Weekly review schedule
6. Tips for maintaining consistency

Consider:
- Harder subjects need more time and should be studied when energy is high
- Subjects with earlier exam dates get higher priority
- Include time for revision and practice
- Balance intensive study with lighter review sessions
`;

    const plan = await callOpenAI(prompt);
    return plan;
  },
});
