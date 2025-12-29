import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function AITutor() {
  const [activeTab, setActiveTab] = useState<"chat" | "explain" | "quiz">("chat");
  const subjects = useQuery(api.subjects.listSubjects);
  const profile = useQuery(api.profiles.getCurrentProfile);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Tutor</h1>
        <p className="text-gray-600 mt-1">
          Get personalized explanations, practice with quizzes, and chat with your AI study companion
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "chat", label: "Chat with AI", icon: "💬" },
            { id: "explain", label: "Concept Explanation", icon: "📖" },
            { id: "quiz", label: "Practice Quiz", icon: "🧠" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "chat" | "explain" | "quiz")}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === "chat" && <ChatInterface subjects={subjects} profile={profile} />}
        {activeTab === "explain" && <ConceptExplainer subjects={subjects} profile={profile} />}
        {activeTab === "quiz" && <QuizGenerator subjects={subjects} />}
      </div>
    </div>
  );
}

function ChatInterface({ subjects, profile }: { subjects: any; profile: any }) {
  const [messages, setMessages] = useState<Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: number;
  }>>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatWithAI = useAction(api.ai.chatWithAI);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: "user" as const,
      content: inputMessage,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await chatWithAI({
        message: inputMessage,
        subject: selectedSubject || undefined,
        difficulty: profile?.preferredDifficulty,
        conversationHistory: messages.slice(-6), // Last 6 messages for context
      });

      const aiMessage = {
        role: "assistant" as const,
        content: response,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error("Failed to get AI response");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">AI Study Assistant</h3>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All subjects</option>
            {subjects?.map((subject: any) => (
              <option key={subject._id} value={subject.name}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 text-2xl">🤖</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Start a conversation</h4>
            <p className="text-sm">
              Ask me anything about your studies! I can help explain concepts, solve problems, 
              or provide study tips.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className={`text-xs mt-1 ${
                message.role === "user" ? "text-blue-100" : "text-gray-500"
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your studies..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function ConceptExplainer({ subjects, profile }: { subjects: any; profile: any }) {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "advanced">("medium");
  const [context, setContext] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const explainConcept = useAction(api.ai.explainConcept);

  const handleExplain = async () => {
    if (!topic.trim() || !selectedSubject) {
      toast.error("Please select a subject and enter a topic");
      return;
    }

    setIsLoading(true);
    try {
      const result = await explainConcept({
        topic: topic.trim(),
        subject: selectedSubject,
        difficulty,
        context: context.trim() || undefined,
      });
      setExplanation(result);
    } catch (error) {
      toast.error("Failed to generate explanation");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Get Concept Explanation</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a subject...</option>
              {subjects?.map((subject: any) => (
                <option key={subject._id} value={subject.name}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic or Concept *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Quadratic equations, Photosynthesis, World War II"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Explanation Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "advanced")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="easy">Easy - Simple terms with basic examples</option>
              <option value="medium">Medium - Detailed with practical examples</option>
              <option value="advanced">Advanced - In-depth technical explanation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Context (Optional)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Any specific aspects you want to focus on or questions you have..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <button
            onClick={handleExplain}
            disabled={!topic.trim() || !selectedSubject || isLoading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Generating Explanation..." : "Explain Concept"}
          </button>
        </div>
      </div>

      {/* Explanation Output */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Explanation</h3>
        
        {explanation ? (
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {explanation}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-2xl">📖</span>
            </div>
            <p>Enter a topic and click "Explain Concept" to get a detailed explanation</p>
          </div>
        )}
      </div>
    </div>
  );
}

function QuizGenerator({ subjects }: { subjects: any }) {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [quiz, setQuiz] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const generateQuiz = useAction(api.ai.generateQuiz);

  const handleGenerateQuiz = async () => {
    if (!topic.trim() || !selectedSubject) {
      toast.error("Please select a subject and enter a topic");
      return;
    }

    setIsLoading(true);
    setQuiz(null);
    setUserAnswers([]);
    setShowResults(false);

    try {
      const result = await generateQuiz({
        subject: selectedSubject,
        topic: topic.trim(),
        difficulty,
        questionCount,
      });
      setQuiz(result);
      setUserAnswers(new Array(result.length).fill(-1));
    } catch (error) {
      toast.error("Failed to generate quiz");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleSubmitQuiz = () => {
    if (userAnswers.some(answer => answer === -1)) {
      toast.error("Please answer all questions before submitting");
      return;
    }
    setShowResults(true);
  };

  const getScore = () => {
    if (!quiz) return 0;
    const correct = userAnswers.filter((answer, index) => 
      answer === quiz[index].correctAnswer
    ).length;
    return Math.round((correct / quiz.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Quiz Generator Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Practice Quiz</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select subject...</option>
              {subjects?.map((subject: any) => (
                <option key={subject._id} value={subject.name}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Algebra, Biology"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Questions
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={3}>3 questions</option>
              <option value={5}>5 questions</option>
              <option value={10}>10 questions</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateQuiz}
          disabled={!topic.trim() || !selectedSubject || isLoading}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Generating Quiz..." : "Generate Quiz"}
        </button>
      </div>

      {/* Quiz Questions */}
      {quiz && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Quiz: {selectedSubject} - {topic}
            </h3>
            {showResults && (
              <div className="text-lg font-semibold text-blue-600">
                Score: {getScore()}%
              </div>
            )}
          </div>

          <div className="space-y-6">
            {quiz.map((question: any, questionIndex: number) => (
              <div key={questionIndex} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  {questionIndex + 1}. {question.question}
                </h4>
                
                <div className="space-y-2">
                  {question.options.map((option: string, optionIndex: number) => {
                    const isSelected = userAnswers[questionIndex] === optionIndex;
                    const isCorrect = optionIndex === question.correctAnswer;
                    const showCorrect = showResults && isCorrect;
                    const showIncorrect = showResults && isSelected && !isCorrect;

                    return (
                      <button
                        key={optionIndex}
                        onClick={() => !showResults && handleAnswerSelect(questionIndex, optionIndex)}
                        disabled={showResults}
                        className={`w-full text-left p-3 border rounded-lg transition-colors ${
                          showCorrect
                            ? "border-green-500 bg-green-50 text-green-700"
                            : showIncorrect
                            ? "border-red-500 bg-red-50 text-red-700"
                            : isSelected
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <span className="font-medium mr-2">
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        {option}
                        {showCorrect && <span className="ml-2 text-green-600">✓</span>}
                        {showIncorrect && <span className="ml-2 text-red-600">✗</span>}
                      </button>
                    );
                  })}
                </div>

                {showResults && (
                  <div className="mt-3 p-3 bg-gray-50 rounded border">
                    <p className="text-sm text-gray-700">
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {!showResults && (
            <button
              onClick={handleSubmitQuiz}
              disabled={userAnswers.some(answer => answer === -1)}
              className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Submit Quiz
            </button>
          )}

          {showResults && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Quiz Complete!</h4>
              <p className="text-blue-800">
                You scored {getScore()}% ({userAnswers.filter((answer, index) => 
                  answer === quiz[index].correctAnswer
                ).length}/{quiz.length} correct)
              </p>
              <button
                onClick={() => {
                  setQuiz(null);
                  setUserAnswers([]);
                  setShowResults(false);
                }}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Generate New Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
