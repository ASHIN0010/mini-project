import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function StudySession() {
  const activeSession = useQuery(api.sessions.getActiveSession);
  const subjects = useQuery(api.subjects.listSubjects);
  const [selectedSubject, setSelectedSubject] = useState<Id<"subjects"> | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Id<"topics"> | null>(null);
  const [sessionNotes, setSessionNotes] = useState("");
  const [focusLevel, setFocusLevel] = useState<"low" | "medium" | "high">("medium");
  const [fatigueLevel, setFatigueLevel] = useState<"low" | "medium" | "high">("low");
  const [interactionCount, setInteractionCount] = useState(0);

  const startSession = useMutation(api.sessions.startStudySession);
  const updateSession = useMutation(api.sessions.updateSessionActivity);
  const endSession = useMutation(api.sessions.endStudySession);

  // Track interactions for behavioral analysis
  useEffect(() => {
    const handleInteraction = () => {
      setInteractionCount(prev => prev + 1);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keypress', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keypress', handleInteraction);
    };
  }, []);

  // Update session activity periodically
  useEffect(() => {
    if (activeSession && interactionCount > 0) {
      updateSession({
        sessionId: activeSession._id,
        interactionCount,
        focusLevel,
        fatigueLevel,
      });
    }
  }, [interactionCount, focusLevel, fatigueLevel, activeSession, updateSession]);

  const handleStartSession = async () => {
    try {
      await startSession({
        subjectId: selectedSubject || undefined,
        topicId: selectedTopic || undefined,
      });
      toast.success("Study session started!");
      setInteractionCount(0);
    } catch (error) {
      toast.error("Failed to start session");
      console.error(error);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;

    try {
      const result = await endSession({
        sessionId: activeSession._id,
        notes: sessionNotes || undefined,
      });
      toast.success(`Session completed! Duration: ${result.duration} minutes`);
      setSessionNotes("");
      setSelectedSubject(null);
      setSelectedTopic(null);
    } catch (error) {
      toast.error("Failed to end session");
      console.error(error);
    }
  };

  const getSessionDuration = () => {
    if (!activeSession) return 0;
    return Math.floor((Date.now() - activeSession.startTime) / (1000 * 60));
  };

  const shouldSuggestBreak = () => {
    const duration = getSessionDuration();
    return duration > 0 && duration % 45 === 0; // Suggest break every 45 minutes
  };

  const getFatigueRecommendation = () => {
    if (fatigueLevel === "high") {
      return "Consider taking a break. High fatigue can reduce learning effectiveness.";
    }
    if (fatigueLevel === "medium" && getSessionDuration() > 60) {
      return "You've been studying for over an hour. A short break might help refresh your mind.";
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Study Session</h1>
        <p className="text-gray-600 mt-1">
          Start focused study sessions with behavioral tracking and adaptive recommendations
        </p>
      </div>

      {/* Active Session Status */}
      {activeSession ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h2 className="text-lg font-semibold text-green-900">Session Active</h2>
            </div>
            <div className="text-green-700 font-medium">
              {getSessionDuration()} minutes
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">
                Focus Level
              </label>
              <select
                value={focusLevel}
                onChange={(e) => setFocusLevel(e.target.value as "low" | "medium" | "high")}
                className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                <option value="low">Low - Distracted</option>
                <option value="medium">Medium - Focused</option>
                <option value="high">High - Deep Focus</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">
                Fatigue Level
              </label>
              <select
                value={fatigueLevel}
                onChange={(e) => setFatigueLevel(e.target.value as "low" | "medium" | "high")}
                className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                <option value="low">Low - Energetic</option>
                <option value="medium">Medium - Slightly Tired</option>
                <option value="high">High - Very Tired</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleEndSession}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                End Session
              </button>
            </div>
          </div>

          {/* Behavioral Recommendations */}
          {getFatigueRecommendation() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-600">⚠️</span>
                <p className="text-yellow-800 text-sm">{getFatigueRecommendation()}</p>
              </div>
            </div>
          )}

          {shouldSuggestBreak() && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600">💡</span>
                <p className="text-blue-800 text-sm">
                  Time for a break! Consider taking 10-15 minutes to rest and recharge.
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-green-700 mb-1">
              Session Notes
            </label>
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="Add notes about what you're learning or any insights..."
            />
          </div>
        </div>
      ) : (
        /* Start New Session */
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Start New Study Session</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject (Optional)
              </label>
              <select
                value={selectedSubject || ""}
                onChange={(e) => {
                  setSelectedSubject(e.target.value ? e.target.value as Id<"subjects"> : null);
                  setSelectedTopic(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a subject...</option>
                {subjects?.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedSubject && (
              <TopicSelector 
                subjectId={selectedSubject}
                selectedTopic={selectedTopic}
                onTopicSelect={setSelectedTopic}
              />
            )}

            <button
              onClick={handleStartSession}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Study Session
            </button>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <RecentSessions />
    </div>
  );
}

function TopicSelector({ 
  subjectId, 
  selectedTopic, 
  onTopicSelect 
}: {
  subjectId: Id<"subjects">;
  selectedTopic: Id<"topics"> | null;
  onTopicSelect: (topicId: Id<"topics"> | null) => void;
}) {
  const topics = useQuery(api.topics.listTopicsBySubject, { subjectId });

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Topic (Optional)
      </label>
      <select
        value={selectedTopic || ""}
        onChange={(e) => onTopicSelect(e.target.value ? e.target.value as Id<"topics"> : null)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Select a topic...</option>
        {topics?.map((topic) => (
          <option key={topic._id} value={topic._id}>
            {topic.name} ({topic.completed ? "Completed" : "In Progress"})
          </option>
        ))}
      </select>
    </div>
  );
}

function RecentSessions() {
  const recentSessions = useQuery(api.sessions.getRecentSessions, { limit: 5 });

  if (!recentSessions || recentSessions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h2>
      
      <div className="space-y-3">
        {recentSessions.map((session) => (
          <div key={session._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">
                {session.duration} minutes
              </p>
              <p className="text-sm text-gray-600">
                {new Date(session.startTime).toLocaleDateString()} at{" "}
                {new Date(session.startTime).toLocaleTimeString()}
              </p>
              {session.notes && (
                <p className="text-sm text-gray-500 mt-1 italic">
                  "{session.notes}"
                </p>
              )}
            </div>
            
            <div className="text-right">
              {session.focusLevel && (
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  session.focusLevel === "high" 
                    ? "bg-green-100 text-green-700"
                    : session.focusLevel === "medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {session.focusLevel} focus
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
