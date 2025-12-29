import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Analytics() {
  const weeklyAnalytics = useQuery(api.sessions.getStudyAnalytics, { days: 7 });
  const monthlyAnalytics = useQuery(api.sessions.getStudyAnalytics, { days: 30 });
  const subjects = useQuery(api.subjects.listSubjects);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Study Analytics</h1>
        <p className="text-gray-600 mt-1">
          Track your learning progress, study patterns, and behavioral insights
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Weekly Study Time"
          value={`${weeklyAnalytics ? Math.round(weeklyAnalytics.totalStudyTime / 60) : 0}h`}
          subtitle={`${weeklyAnalytics?.totalSessions || 0} sessions`}
          icon="⏱️"
          color="blue"
        />
        
        <StatCard
          title="Average Session"
          value={`${weeklyAnalytics ? Math.round(weeklyAnalytics.averageSessionLength) : 0}m`}
          subtitle="per session"
          icon="📊"
          color="green"
        />
        
        <StatCard
          title="Active Subjects"
          value={subjects?.length || 0}
          subtitle={`${subjects?.filter(s => s.completedTopics > 0).length || 0} with progress`}
          icon="📚"
          color="purple"
        />
        
        <StatCard
          title="Completion Rate"
          value={`${subjects && subjects.length > 0 
            ? Math.round((subjects.reduce((sum, s) => sum + (s.completedTopics / s.totalTopics), 0) / subjects.length) * 100)
            : 0}%`}
          subtitle="average progress"
          icon="🎯"
          color="orange"
        />
      </div>

      {/* Study Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Focus & Fatigue Analysis */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Focus & Fatigue Patterns</h2>
          
          {weeklyAnalytics ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Focus Level Distribution</h3>
                <div className="space-y-2">
                  <FocusBar 
                    label="High Focus" 
                    value={weeklyAnalytics.focusDistribution.high} 
                    total={weeklyAnalytics.totalSessions}
                    color="green"
                  />
                  <FocusBar 
                    label="Medium Focus" 
                    value={weeklyAnalytics.focusDistribution.medium} 
                    total={weeklyAnalytics.totalSessions}
                    color="yellow"
                  />
                  <FocusBar 
                    label="Low Focus" 
                    value={weeklyAnalytics.focusDistribution.low} 
                    total={weeklyAnalytics.totalSessions}
                    color="red"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Fatigue Level Distribution</h3>
                <div className="space-y-2">
                  <FocusBar 
                    label="Low Fatigue" 
                    value={weeklyAnalytics.fatigueDistribution.low} 
                    total={weeklyAnalytics.totalSessions}
                    color="green"
                  />
                  <FocusBar 
                    label="Medium Fatigue" 
                    value={weeklyAnalytics.fatigueDistribution.medium} 
                    total={weeklyAnalytics.totalSessions}
                    color="yellow"
                  />
                  <FocusBar 
                    label="High Fatigue" 
                    value={weeklyAnalytics.fatigueDistribution.high} 
                    total={weeklyAnalytics.totalSessions}
                    color="red"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No study sessions recorded yet</p>
            </div>
          )}
        </div>

        {/* Daily Study Pattern */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Study Pattern</h2>
          
          {weeklyAnalytics && weeklyAnalytics.dailyStats.length > 0 ? (
            <div className="space-y-3">
              {weeklyAnalytics.dailyStats.slice(-7).map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min((day.duration / 240) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {Math.round(day.duration / 60)}h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No daily data available yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Subject Progress */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject Progress Overview</h2>
        
        {subjects && subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <SubjectProgressCard key={subject._id} subject={subject} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-2xl">📚</span>
            </div>
            <p>No subjects added yet</p>
            <p className="text-sm mt-1">Add subjects to see progress analytics</p>
          </div>
        )}
      </div>

      {/* Behavioral Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Behavioral Insights & Recommendations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Study Patterns</h3>
            <div className="space-y-2 text-sm">
              {weeklyAnalytics ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average session length:</span>
                    <span className="font-medium">{Math.round(weeklyAnalytics.averageSessionLength)} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sessions this week:</span>
                    <span className="font-medium">{weeklyAnalytics.totalSessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Most productive day:</span>
                    <span className="font-medium">
                      {weeklyAnalytics.dailyStats.length > 0 
                        ? new Date(weeklyAnalytics.dailyStats.reduce((max, day) => 
                            day.duration > max.duration ? day : max
                          ).date).toLocaleDateString('en-US', { weekday: 'long' })
                        : 'N/A'
                      }
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Start studying to see patterns</p>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Recommendations</h3>
            <div className="space-y-2 text-sm">
              {weeklyAnalytics ? (
                <>
                  {weeklyAnalytics.averageSessionLength > 90 && (
                    <div className="flex items-start space-x-2">
                      <span className="text-yellow-600">⚠️</span>
                      <p className="text-gray-700">Consider shorter sessions with breaks to maintain focus</p>
                    </div>
                  )}
                  {weeklyAnalytics.fatigueDistribution.high > weeklyAnalytics.totalSessions * 0.3 && (
                    <div className="flex items-start space-x-2">
                      <span className="text-red-600">🔋</span>
                      <p className="text-gray-700">High fatigue detected. Try studying during your peak energy hours</p>
                    </div>
                  )}
                  {weeklyAnalytics.focusDistribution.high > weeklyAnalytics.totalSessions * 0.7 && (
                    <div className="flex items-start space-x-2">
                      <span className="text-green-600">🎯</span>
                      <p className="text-gray-700">Great focus levels! Keep up the excellent work</p>
                    </div>
                  )}
                  {weeklyAnalytics.totalSessions < 3 && (
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-600">📅</span>
                      <p className="text-gray-700">Try to maintain more consistent study sessions</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Recommendations will appear after you start studying</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color 
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <span className="text-lg">{icon}</span>
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function FocusBar({ 
  label, 
  value, 
  total, 
  color 
}: {
  label: string;
  value: number;
  total: number;
  color: "green" | "yellow" | "red";
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  const colorClasses = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700 w-24">{label}</span>
      <div className="flex-1 mx-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${colorClasses[color]}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
      <span className="text-sm text-gray-600 w-12 text-right">
        {value} ({Math.round(percentage)}%)
      </span>
    </div>
  );
}

function SubjectProgressCard({ subject }: { subject: any }) {
  const progressPercentage = subject.totalTopics > 0 
    ? (subject.completedTopics / subject.totalTopics) * 100 
    : 0;

  const priorityColors: Record<string, string> = {
    high: "border-red-200 bg-red-50",
    medium: "border-yellow-200 bg-yellow-50",
    low: "border-green-200 bg-green-50",
  };

  return (
    <div className={`border rounded-lg p-4 ${priorityColors[subject.priority] || priorityColors.medium}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{subject.name}</h3>
        <span className="text-xs text-gray-600">{subject.priority} priority</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{Math.round(progressPercentage)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-600">
          <span>{subject.completedTopics}/{subject.totalTopics} topics</span>
          {subject.examDate && (
            <span>Exam: {new Date(subject.examDate).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}
