import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function StudyPlanner() {
  const subjects = useQuery(api.subjects.listSubjects);
  const profile = useQuery(api.profiles.getCurrentProfile);
  const [studyPlan, setStudyPlan] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateStudyPlan = useAction(api.ai.generateStudyPlan);

  const handleGeneratePlan = async () => {
    if (!subjects || subjects.length === 0) {
      toast.error("Please add some subjects first");
      return;
    }

    if (!profile) {
      toast.error("Profile not found");
      return;
    }

    setIsGenerating(true);
    try {
      const subjectsData = subjects.map(subject => ({
        name: subject.name,
        difficulty: subject.difficulty,
        examDate: subject.examDate,
        topics: subject.totalTopics,
      }));

      const plan = await generateStudyPlan({
        subjects: subjectsData,
        dailyHours: profile.dailyStudyHours,
        studyIntensity: profile.studyIntensity,
      });

      setStudyPlan(plan);
    } catch (error) {
      toast.error("Failed to generate study plan");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Study Planner</h1>
        <p className="text-gray-600 mt-1">
          Generate personalized study schedules based on your subjects, goals, and preferences
        </p>
      </div>

      {/* Current Settings Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Study Profile</h2>
        
        {profile ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900">Daily Study Time</h3>
              <p className="text-2xl font-bold text-blue-600">{profile.dailyStudyHours}h</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-medium text-purple-900">Study Intensity</h3>
              <p className="text-2xl font-bold text-purple-600 capitalize">{profile.studyIntensity}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-medium text-green-900">Active Subjects</h3>
              <p className="text-2xl font-bold text-green-600">{subjects?.length || 0}</p>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">Loading profile...</div>
        )}
      </div>

      {/* Subjects Overview */}
      {subjects && subjects.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Subjects</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <div key={subject._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
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
                    <span>Difficulty:</span>
                    <span className="font-medium">{subject.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Progress:</span>
                    <span className="font-medium">
                      {subject.completedTopics}/{subject.totalTopics}
                    </span>
                  </div>
                  {subject.examDate && (
                    <div className="flex justify-between">
                      <span>Exam:</span>
                      <span className="font-medium">
                        {new Date(subject.examDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Study Plan */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">AI-Generated Study Plan</h2>
          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating || !subjects || subjects.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? "Generating..." : "Generate Study Plan"}
          </button>
        </div>

        {studyPlan ? (
          <div className="prose prose-sm max-w-none">
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {studyPlan}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-2xl">📅</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No study plan generated yet</h3>
            <p className="text-gray-600 mb-4">
              Click "Generate Study Plan" to create a personalized schedule based on your subjects and preferences
            </p>
            {(!subjects || subjects.length === 0) && (
              <p className="text-sm text-red-600">
                Please add some subjects first before generating a study plan
              </p>
            )}
          </div>
        )}
      </div>

      {/* Study Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Smart Study Tips</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <span className="text-blue-600 text-lg">🧠</span>
              <div>
                <h4 className="font-medium text-gray-900">Spaced Repetition</h4>
                <p className="text-sm text-gray-600">
                  Review material at increasing intervals to improve long-term retention
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="text-green-600 text-lg">⏰</span>
              <div>
                <h4 className="font-medium text-gray-900">Pomodoro Technique</h4>
                <p className="text-sm text-gray-600">
                  Study in 25-minute focused sessions with 5-minute breaks
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <span className="text-purple-600 text-lg">🎯</span>
              <div>
                <h4 className="font-medium text-gray-900">Active Recall</h4>
                <p className="text-sm text-gray-600">
                  Test yourself regularly instead of just re-reading notes
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="text-orange-600 text-lg">📊</span>
              <div>
                <h4 className="font-medium text-gray-900">Progress Tracking</h4>
                <p className="text-sm text-gray-600">
                  Monitor your study sessions and adjust your plan accordingly
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
