import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function SubjectManager() {
  const subjects = useQuery(api.subjects.listSubjects);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Id<"subjects"> | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subject Management</h1>
          <p className="text-gray-600 mt-1">
            Organize your subjects and track your learning progress
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Add Subject
        </button>
      </div>

      {showAddForm && (
        <AddSubjectForm onClose={() => setShowAddForm(false)} />
      )}

      {subjects && subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <SubjectCard 
              key={subject._id} 
              subject={subject}
              onSelect={() => setSelectedSubject(subject._id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">📚</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects yet</h3>
          <p className="text-gray-600 mb-4">
            Start by adding your first subject to begin organizing your studies
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Add Your First Subject
          </button>
        </div>
      )}

      {selectedSubject && (
        <SubjectDetails 
          subjectId={selectedSubject}
          onClose={() => setSelectedSubject(null)}
        />
      )}
    </div>
  );
}

function AddSubjectForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
    examDate: "",
    totalTopics: 10,
    priority: "medium" as "low" | "medium" | "high",
  });

  const createSubject = useMutation(api.subjects.createSubject);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createSubject({
        name: formData.name,
        description: formData.description || undefined,
        difficulty: formData.difficulty,
        examDate: formData.examDate ? new Date(formData.examDate).getTime() : undefined,
        totalTopics: formData.totalTopics,
        priority: formData.priority,
      });
      toast.success("Subject added successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to add subject");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Add New Subject</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Mathematics, Physics, History"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Brief description of the subject"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  difficulty: e.target.value as "easy" | "medium" | "hard" 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  priority: e.target.value as "low" | "medium" | "high" 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam Date
              </label>
              <input
                type="date"
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Topics
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.totalTopics}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  totalTopics: parseInt(e.target.value) 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Adding..." : "Add Subject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SubjectCard({ subject, onSelect }: { 
  subject: any; 
  onSelect: () => void; 
}) {
  const progressPercentage = subject.totalTopics > 0 
    ? (subject.completedTopics / subject.totalTopics) * 100 
    : 0;

  const priorityColors: Record<string, string> = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-green-100 text-green-700 border-green-200",
  };

  const difficultyColors: Record<string, string> = {
    hard: "text-red-600",
    medium: "text-yellow-600",
    easy: "text-green-600",
  };

  return (
    <div 
      onClick={onSelect}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${priorityColors[subject.priority] || priorityColors.medium}`}>
          {subject.priority}
        </span>
      </div>

      {subject.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {subject.description}
        </p>
      )}

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">
              {subject.completedTopics}/{subject.totalTopics} topics
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className={`font-medium ${difficultyColors[subject.difficulty] || difficultyColors.medium}`}>
            {subject.difficulty} difficulty
          </span>
          {subject.examDate && (
            <span className="text-gray-600">
              Exam: {new Date(subject.examDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SubjectDetails({ subjectId, onClose }: { 
  subjectId: Id<"subjects">; 
  onClose: () => void; 
}) {
  const subjectProgress = useQuery(api.subjects.getSubjectProgress, { subjectId });
  const [showAddTopic, setShowAddTopic] = useState(false);

  if (!subjectProgress) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {subjectProgress.subject.name}
            </h2>
            <p className="text-gray-600">
              {subjectProgress.completedTopics}/{subjectProgress.totalTopics} topics completed 
              ({Math.round(subjectProgress.progressPercentage)}%)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Topics</h3>
              <button
                onClick={() => setShowAddTopic(true)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Add Topic
              </button>
            </div>

            {subjectProgress.topics.length > 0 ? (
              <div className="space-y-3">
                {subjectProgress.topics.map((topic) => (
                  <TopicCard key={topic._id} topic={topic} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No topics added yet. Start by adding your first topic.
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Subject Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className="font-medium">{subjectProgress.subject.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Priority:</span>
                  <span className="font-medium">{subjectProgress.subject.priority}</span>
                </div>
                {subjectProgress.subject.examDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Exam Date:</span>
                    <span className="font-medium">
                      {new Date(subjectProgress.subject.examDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Mastery:</span>
                  <span className="font-medium">{Math.round(subjectProgress.averageMastery)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showAddTopic && (
          <AddTopicForm 
            subjectId={subjectId}
            onClose={() => setShowAddTopic(false)}
          />
        )}
      </div>
    </div>
  );
}

function TopicCard({ topic }: { topic: any }) {
  const updateProgress = useMutation(api.topics.updateTopicProgress);

  const handleToggleComplete = async () => {
    try {
      await updateProgress({
        topicId: topic._id,
        completed: !topic.completed,
        masteryLevel: topic.completed ? 0 : 100,
      });
    } catch (error) {
      toast.error("Failed to update topic");
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">{topic.name}</h4>
        <button
          onClick={handleToggleComplete}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
            topic.completed 
              ? "bg-green-500 border-green-500 text-white" 
              : "border-gray-300 hover:border-green-500"
          }`}
        >
          {topic.completed && "✓"}
        </button>
      </div>
      
      {topic.description && (
        <p className="text-sm text-gray-600 mb-2">{topic.description}</p>
      )}
      
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">
          {topic.difficulty} • {topic.estimatedHours}h estimated
        </span>
        <span className="text-gray-600">
          Mastery: {topic.masteryLevel}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
        <div 
          className="bg-blue-600 h-1 rounded-full"
          style={{ width: `${topic.masteryLevel}%` }}
        ></div>
      </div>
    </div>
  );
}

function AddTopicForm({ subjectId, onClose }: { 
  subjectId: Id<"subjects">; 
  onClose: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
    estimatedHours: 2,
  });

  const createTopic = useMutation(api.topics.createTopic);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createTopic({
        subjectId,
        name: formData.name,
        description: formData.description || undefined,
        difficulty: formData.difficulty,
        estimatedHours: formData.estimatedHours,
      });
      toast.success("Topic added successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to add topic");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add New Topic</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Linear Equations, World War II"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Brief description of the topic"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  difficulty: e.target.value as "easy" | "medium" | "hard" 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                min="0.5"
                max="20"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  estimatedHours: parseFloat(e.target.value) 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Adding..." : "Add Topic"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
