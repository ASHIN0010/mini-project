import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SubjectManager } from "./SubjectManager";
import { StudySession } from "./StudySession";
import { AITutor } from "./AITutor";
import { Analytics } from "./Analytics";
import { StudyPlanner } from "./StudyPlanner";

type TabType = "overview" | "subjects" | "study" | "tutor" | "planner" | "analytics";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const profile = useQuery(api.profiles.getCurrentProfile);
  const subjects = useQuery(api.subjects.listSubjects);
  const analytics = useQuery(api.sessions.getStudyAnalytics, { days: 7 });

  const tabs = [
    { id: "overview", label: "Overview", icon: "🏠" },
    { id: "subjects", label: "Subjects", icon: "📚" },
    { id: "study", label: "Study Session", icon: "⏱️" },
    { id: "tutor", label: "AI Tutor", icon: "🤖" },
    { id: "planner", label: "Study Planner", icon: "📅" },
    { id: "analytics", label: "Analytics", icon: "📊" },
  ];

  if (!profile) return null;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome back, {profile.name}!
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {profile.studyIntensity} intensity • {profile.dailyStudyHours}h daily
          </p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Quick Stats */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="text-sm font-medium text-gray-900 mb-2">This Week</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Study Time:</span>
                <span className="font-medium">
                  {analytics ? Math.round(analytics.totalStudyTime / 60) : 0}h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sessions:</span>
                <span className="font-medium">{analytics?.totalSessions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subjects:</span>
                <span className="font-medium">{subjects?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "subjects" && <SubjectManager />}
          {activeTab === "study" && <StudySession />}
          {activeTab === "tutor" && <AITutor />}
          {activeTab === "planner" && <StudyPlanner />}
          {activeTab === "analytics" && <Analytics />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab() {
  const subjects = useQuery(api.subjects.listSubjects);
  const analytics = useQuery(api.sessions.getStudyAnalytics, { days: 7 });
  const activeSession = useQuery(api.sessions.getActiveSession);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">
          Track your progress and manage your personalized learning journey
        </p>
      </div>

      {/* Active Session Alert */}
      {activeSession && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-green-600 text-lg">⏱️</span>
            <div>
              <h3 className="font-medium text-green-900">Study Session Active</h3>
              <p className="text-sm text-green-700">
                Started {new Date(activeSession.startTime).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-lg">📚</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Subjects</p>
              <p className="text-2xl font-bold text-gray-900">{subjects?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-lg">⏱️</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Study Hours (7d)</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics ? Math.round(analytics.totalStudyTime / 60) : 0}h
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-lg">🎯</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sessions (7d)</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalSessions || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 text-lg">📈</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Session</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics ? Math.round(analytics.averageSessionLength) : 0}m
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Subjects */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Subjects</h2>
        {subjects && subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.slice(0, 6).map((subject) => (
              <div key={subject._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{subject.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    subject.priority === "high" 
                      ? "bg-red-100 text-red-700"
                      : subject.priority === "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {subject.priority}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Progress:</span>
                    <span>{subject.completedTopics}/{subject.totalTopics}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${subject.totalTopics > 0 ? (subject.completedTopics / subject.totalTopics) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  {subject.examDate && (
                    <p className="text-xs">
                      Exam: {new Date(subject.examDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No subjects added yet</p>
            <p className="text-sm text-gray-400">
              Start by adding your subjects in the Subjects tab
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
