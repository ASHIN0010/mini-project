import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ProfileSetup() {
  const [formData, setFormData] = useState({
    name: "",
    studyIntensity: "medium" as "low" | "medium" | "high",
    preferredDifficulty: "medium" as "easy" | "medium" | "advanced",
    dailyStudyHours: 4,
    breakFrequency: 45,
  });

  const createProfile = useMutation(api.profiles.createProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createProfile(formData);
      toast.success("Profile created successfully!");
    } catch (error) {
      toast.error("Failed to create profile");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Smart Study Companion
          </h2>
          <p className="text-gray-600">
            Let's set up your personalized learning profile to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Study Intensity Preference
            </label>
            <select
              value={formData.studyIntensity}
              onChange={(e) => setFormData({ 
                ...formData, 
                studyIntensity: e.target.value as "low" | "medium" | "high" 
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low - Relaxed pace with frequent breaks</option>
              <option value="medium">Medium - Balanced approach</option>
              <option value="high">High - Intensive focused sessions</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Learning Difficulty
            </label>
            <select
              value={formData.preferredDifficulty}
              onChange={(e) => setFormData({ 
                ...formData, 
                preferredDifficulty: e.target.value as "easy" | "medium" | "advanced" 
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="easy">Easy - Simple explanations with basic examples</option>
              <option value="medium">Medium - Detailed explanations with practical examples</option>
              <option value="advanced">Advanced - In-depth technical explanations</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Study Hours Available
            </label>
            <input
              type="number"
              min="1"
              max="12"
              value={formData.dailyStudyHours}
              onChange={(e) => setFormData({ 
                ...formData, 
                dailyStudyHours: parseInt(e.target.value) 
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              How many hours can you dedicate to studying each day?
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Break Frequency (minutes)
            </label>
            <input
              type="number"
              min="15"
              max="120"
              step="15"
              value={formData.breakFrequency}
              onChange={(e) => setFormData({ 
                ...formData, 
                breakFrequency: parseInt(e.target.value) 
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              How often would you like to take breaks during study sessions?
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !formData.name.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Creating Profile..." : "Create Profile & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
